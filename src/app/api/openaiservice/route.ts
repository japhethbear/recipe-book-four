import { NextResponse } from "next/server";
import OpenAI from "openai";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { html } = (await req.json()) as { html: string };
  console.log(html);
  if (!html) {
    return NextResponse.json(
      { message: "No HTML provided. Please try again." },
      { status: 400 }
    );
  }
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

  return NextResponse.json(scrapedData);
}
