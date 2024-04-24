"use client";

import { useState } from "react";
import Image from "next/image";
import TheBearEssentialsGraphic from "@/assets/TheBearEssentialsGraphic.png";
import OpenAI from "openai";
import "dotenv/config";
import puppeteer from "puppeteer-core";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  async function scraper(url: string): Promise<Recipe> {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://${process.env.BRIGHT_DATA_AUTH}@brd.superproxy.io:9222`,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Get just the body elements from the HTML with text
    //   const html = await page.evaluate(() => document.body.innerHTML);

    const html = await page.evaluate(() => {
      // Function to determine if an element contains recipe-like content

      function isLikelyRecipeContainer(element: Element) {
        // Extract class names, IDs, and tag name of the element
        const classNames = element.classList;
        const id = element.id;
        const tagName = element.tagName.toLowerCase();

        // Define keywords related to recipe content
        const keywords = [
          // "article",
          // "content",
          // "title",
          // "ingredient",
          // "ingredients",
          // "instruction",
          // "instructions",
          // "recipe-container",
          "wprm-recipe-name",
          "recipe-ingredients-container",
          "recipe-instructions-container",
        ];

        // Check if any of the keywords are found in class names, ID, or tag name
        if (classNames.length > 0 || id !== "") {
          // Check class names for keywords
          for (let i = 0; i < classNames.length; i++) {
            const className = classNames[i];
            if (
              keywords.some((keyword) =>
                className.toLowerCase().includes(keyword)
              )
            ) {
              return true;
            }
          }
        }

        // Check ID for keywords
        if (id !== "") {
          if (keywords.some((keyword) => id.toLowerCase().includes(keyword))) {
            return true;
          }
        }

        // Check tag name for keywords
        if (keywords.includes(tagName)) {
          return true;
        }

        return false;
      }

      const recipeElements = document.querySelectorAll("div, section, article"); // Select potential recipe containers
      const recipeContent: string[] = [];

      // Iterate over potential recipe containers
      recipeElements.forEach((element) => {
        // Check if the element contains recipe-like content (e.g., by analyzing its children, class names, etc.)
        if (isLikelyRecipeContainer(element)) {
          // If the element is identified as a recipe container, add its inner HTML to the recipe content array
          recipeContent.push(element.innerHTML);
        }
      });

      // Combine and return the inner HTML of all identified recipe containers
      return recipeContent.join("");
    });

    console.log(html);

    // Close the browser

    await browser.close();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Here is the HTML of a recipe website page: ${html}. Please give me the title, the ingredients, and the instructions of the recipe back in JSON format.`,
          },
        ],
      });

      console.log(1, response);
      console.log(2, response.choices[0].message.content);

      try {
        const responseDataString = response.choices[0].message.content;

        if (!responseDataString) {
          throw new Error("Failed to scrape the recipe. Please try again.");
        }

        const responseData = JSON.parse(responseDataString);

        const title = responseData.title;
        const ingredients = responseData.ingredients.map((ingredient: any) => {
          let formattedIngredient = ingredient.amount;
          if (ingredient.unit) {
            formattedIngredient += ` ${ingredient.unit}`;
          }
          formattedIngredient += ` ${ingredient.name}`;
          if (ingredient.notes) {
            formattedIngredient += ` (${ingredient.notes})`;
          }
          return formattedIngredient;
        });
        const instructions = responseData.instructions;

        const scrapedData: Recipe = {
          title: title,
          ingredients: ingredients,
          instructions: instructions,
        };

        return scrapedData;
      } catch (error) {
        setError("Failed to scrape the recipe. Please try again.");
        console.log(error);
        setLoading(false);
        throw error;
      }
    } catch (error) {
      setError("Failed to scrape the recipe. Please try again.");
      console.log(error);
      setLoading(false);
      throw error;
    }
  }

  // Get the html of the page via screenshot
  //   const imgBase64 = await page.screenshot({
  //     path: "screenshot.png",
  //     fullPage: true,
  //     encoding: "base64",
  //   });

  // Using gpt-4-turbo
  // const response = await openai.chat.completions.create({
  //     model: "gpt-4-turbo",
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           {
  //             type: "text",
  //             text: "Give me the title, the ingredients, and the instructions of the recipe back in JSON format.",
  //           },
  //           {
  //             type: "image_url",
  //             image_url: {
  //               url: "data:image/jpeg;base64," + imgBase64,
  //               detail: "auto",
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const url = form.url.value as string;

    setLoading(true);
    setError(null);
    await scraper(url);
    setLoading(false);
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
      <div className="flex flex-col justify-items-center align-items">
        <form
          onSubmit={handleSubmit}
          className="form-control justify-items-center mx-10"
        >
          <input
            type="text"
            id="url"
            name="url"
            placeholder="URL here"
            className="input w-full sm:max-w-sm md:max-w-md lg:max-w-full input-bordered"
          />
          <label htmlFor="url"></label>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-info sm:max-w-sm md:max-w-md lg:max-w-full"
          >
            {loading ? "Loading..." : "Scrape Recipe"}
          </button>
        </form>
        {error && <p className="text-error">{error}</p>}
      </div>
      <div className="flex flex-col w-full">
        <div className="divider mx-10"></div>
      </div>
      {/* /* // Recipe Display Here // */}
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
}
