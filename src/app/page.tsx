"use client";

import { useState } from "react";
import Image from "next/image";
import TheBearEssentialsGraphic from "@/assets/TheBearEssentialsGraphic.png";
import Form from "@/components/Form";
import RecipeDisplay from "@/components/RecipeDisplay";
import "dotenv/config";
import scraper from "@/Services/ScraperService";
import processHTML from "@/Services/OpenAIService";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}
const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const url = form.url.value as string;

    setLoading(true);
    setError(null);
    try {
      const html = await scraper(url);
      const processedRecipe = await processHTML(html);
      setRecipe(processedRecipe);
    } catch (error) {
      setError("Failed to scrape the recipe. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="navbar bg-base-100 mx-10">
        <div className="flex-1">
          <Image
            src={TheBearEssentialsGraphic}
            alt="The Bear Essentials"
            height={150}
            width={150}
          />
        </div>
        <div className="flex-none mx-10">
          <h2 className="text-2xl mx-10">The Bear Essentials Recipe Scraper</h2>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="divider mx-10"></div>
      </div>
      {/* // Web Scraping Form Here // */}
      <Form handleSubmit={handleSubmit} loading={loading} error={error} />
      <div className="flex flex-col w-full">
        <div className="divider mx-10"></div>
      </div>
      {/* /* // Recipe Display Here // */}
      <RecipeDisplay recipe={recipe} />
      <button className="btn btn-accent mx-10 mt-5">Print</button>
    </>
  );
};

export default Home;
