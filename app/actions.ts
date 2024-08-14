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
  const filePath = path.join(process.cwd(), "downloads", fileName);
  const publicUrl = `/downloads/${fileName}`;

  await fs.promises.writeFile(filePath, data);

  console.log("Saved to downloads:", publicUrl);

  return publicUrl;
}

async function getCSVFromAI(description: string): Promise<string> {
  console.log("Generating project plan for:", description);

  if (!openai) {
    console.log("Using test data for project plan");
    return getTestCSVData();
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
I am going to give you a project description below in triple-quotes, and you are to create a realistic Work Breakdown Structure for the project. After creating the project, put it into a CSV format, which is detailed below

### CSV Columns:
1. **WBS**: This represents the Work Breakdown Structure. It should follow a hierarchical numbering format such as "1.1.1", where the first number indicates the project, the second number indicates the group within the project, and the third number represents the specific task within that group.
2. **Name**: The name of the project, group, or task.
3. **Type**: The type of entry, which can be one of the following:
   - "project" for the overall project.
   - "group" for a group of tasks within the project.
   - "task" for individual tasks.
4. **Start Date**: The start date of the task in the format YYYY-MM-DD. For groups and projects, this should be the earliest start date among all tasks within them.
5. **End Date**: The end date of the task in the format YYYY-MM-DD. For groups and projects, this should be the latest end date among all tasks within them.

### Instructions:
1. **First Row**: The first row of the CSV should contain the column names: WBS, Name, Type, Start Date, End Date.
2. **Hierarchy**: 
   - Every task belongs to a group, and each group belongs to a project. 
   - Groups can also be nested within other groups.
   - For the sake of this request, use just one project, which should be the first content row with a "WBS" value of "1". All other groups and tasks should be nested under that.
3. **Robustness**:
   - The project should be robust, with all of the tasks and groups necessary to plan and execute the project.
   - The timeline for tasks should be realistic, accounting for the time necessary to complete the task.
4. **Output**:
   - Do not explain what you are doing. Only reply with the text in CSV format.

### Project description:

"""${description}"""
            `,
        },
      ],
      model: "gpt-4o-mini",
    });

    const result = completion.choices[0].message.content;

    if (!result) {
      throw new Error("ChatGPT completion result is empty");
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
