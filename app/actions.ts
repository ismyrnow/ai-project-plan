"use server";

import { put } from "@vercel/blob";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { z } from "zod";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const USE_VERCEL_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function generateProject(prevState: any, formData: FormData) {
  const schema = z.object({
    description: z.string().min(1),
  });
  const data = schema.parse({
    description: formData.get("description"),
  });

  try {
    const csvData = await getCSVFromAI(data.description);
    const publicUrl = await saveCSV(csvData);

    return { url: publicUrl };
  } catch (e) {
    console.error("Error generating project:", e);
    return { error: true };
  }
}

async function saveCSV(csvData: string) {
  try {
    const fileName = `project-plan-${Math.random()
      .toString(36)
      .substring(2, 8)}.csv`;

    if (USE_VERCEL_BLOB) {
      return saveFileToVercelBlob(fileName, csvData);
    } else {
      return saveFileToDownloads(fileName, csvData);
    }
  } catch (error) {
    console.error("Error saving CSV file:", error);
    throw new Error("Failed to save CSV file");
  }
}

async function saveFileToVercelBlob(fileName: string, data: string) {
  const blob = await put(fileName, data, {
    access: "public",
  });

  console.log("Saved to blob:", blob.url);

  return blob.url;
}

async function saveFileToDownloads(fileName: string, data: string) {
  const filePath = path.join(process.cwd(), "public", "downloads", fileName);
  const publicUrl = `/downloads/${fileName}`;

  await fs.promises.writeFile(filePath, data);

  console.log("Saved to downloads:", publicUrl);

  return publicUrl;
}

async function getCSVFromAI(description: string): Promise<string> {
  if (!openai) {
    return getTestCSVData();
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
            I need a project plan for ${description}. I would like the plan to put into a CSV format.

Here is an example of an acceptable CSV format:

"WBS #","Name / Title",Type,"Start Date","End Date"
1,"ChatGPT Gantt Chart Template",project,2024-06-18,2024-07-02
1.1,"Group 1",group,2024-06-18,2024-06-28
1.1.1,"Task 1",task,2024-06-18,2024-06-22
1.1.2,"Task 2",task,2024-06-20,2024-06-21
1.1.3,"Task 3",task,2024-06-21,2024-06-28
1.2,"Group 2",group,2024-06-23,2024-07-02
1.2.1,"Task 1",task,2024-06-23,2024-06-25
1.2.2,"Task 2",task,2024-06-26,2024-06-28
1.2.3,"Task 3",task,2024-06-29,2024-07-02

A single project row is required, and all tasks must have a parent group. The number of groups and tasks can vary. The plan should include all of the steps and sub-steps necessary to complete the project.

Don't explain what you're doing, only respond with text in a CSV format.
            `,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const result = completion.choices[0].message.content;

    if (!result) {
      throw new Error("Failed to generate project plan");
    }

    return result;
  } catch (error) {
    console.error("Error generating project plan:", error);
    throw new Error("Failed to generate project plan");
  }
}

function getTestCSVData() {
  return Promise.resolve(`WBS #,Name / Title,Type,Start Date,End Date
    1,Pool Installation Project,project,2024-06-20,2024-08-01
    1.1,Planning,group,2024-06-20,2024-06-30
    1.1.1,Design pool layout,task,2024-06-20,2024-06-23
    1.1.2,Obtain permits,task,2024-06-24,2024-06-26
    1.1.3,Hire contractor,task,2024-06-27,2024-06-30
    1.2,Excavation,group,2024-07-01,2024-07-07
    1.2.1,Clear site,task,2024-07-01,2024-07-02
    1.2.2,Excavate pool area,task,2024-07-03,2024-07-07
    1.3,Installation,group,2024-07-08,2024-07-25
    1.3.1,Install pool shell,task,2024-07-08,2024-07-12
    1.3.2,Install plumbing and electrical,task,2024-07-13,2024-07-18
    1.3.3,Fill and test pool,task,2024-07-19,2024-07-25
    1.4,Finishing,group,2024-07-26,2024-08-01
    1.4.1,Landscaping,task,2024-07-26,2024-07-28
    1.4.2,Final inspection,task,2024-07-29,2024-07-31
    1.4.3,Project handover,task,2024-08-01,2024-08-01`);
}
