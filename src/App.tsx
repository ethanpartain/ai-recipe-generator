import { FormEvent, useState } from "react";
import { Amplify } from "aws-amplify";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const ingredients = (formData.get("ingredients") as string).split(",").map(i => i.trim());
      
      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients: ingredients,
      });

      if (!errors) {
        setResult(data?.body || "No recipe generated");
      } else {
        console.log(errors);
        setResult(`Error: ${errors[0].message}`);
      }
    } catch (e) {
      console.error(e);
      setResult("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe on
          demand...
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div style={{marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px'}}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <p style={{color: 'black', fontSize: '16px', whiteSpace: 'pre-wrap'}}>{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;