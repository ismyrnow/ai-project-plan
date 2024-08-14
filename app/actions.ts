"use server";

import { z } from "zod";
import OpenAI from "openai";
import generateProjectCSV from "./lib/generate-project-csv";
import saveCSV from "./lib/save-csv";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function generateProject(prevState: any, formData: FormData) {
  const schema = z.object({
    description: z.string().min(1),
  });
  const data = schema.parse({
    description: formData.get("description"),
  });

  try {
    const csvData = await generateProjectCSV(data.description, openai);
    const publicUrl = await saveCSV(csvData);

    return { url: publicUrl };
  } catch (e) {
    console.error("Error generating project:", e);
    return { error: true };
  }
}
