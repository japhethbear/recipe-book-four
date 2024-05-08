import "dotenv/config";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface URL {
  url: string;
}

export async function POST(req: Request) {
  const { url } = (await req.json()) as URL;
  console.log(url);

  if (!url) {
    return NextResponse.json(
      { message: "Please provide a URL." },
      { status: 400 }
    );
  }

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

  // Close the browser

  await browser.close();

  return NextResponse.json({ html });

  // Send the HTML back to the client
}

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "user",
//           content: `Here is the HTML of a recipe website page: ${html}. Please give me the title, the ingredients, and the instructions of the recipe back in JSON format.`,
//         },
//       ],
//     });

//     console.log(1, response);
//     console.log(2, response.choices[0].message.content);
//   } catch (error) {
//     console.log(error);
//   }
// }

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
