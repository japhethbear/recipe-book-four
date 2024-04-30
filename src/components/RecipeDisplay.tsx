import React from "react";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

interface RecipeDisplayProps {
  recipe: Recipe | null;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  return (
    <>
      {recipe && (
        <div className="flex flex-col mx-10 my-5">
          <h2>Recipe Title: {recipe.title}</h2>
          <h3>Ingredients: </h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>

          <h3>Instructions: </h3>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      )}
      <button className="btn btn-accent mx-10 mt-5">Print</button>
    </>
  );
};

export default RecipeDisplay;
