import type OpenAI from "openai";

export default async function generateProjectCSV(
  description: string,
  openai: OpenAI | null
): Promise<string> {
  console.log("Generating project plan for:", description);

  if (!openai) {
    console.log("Using test data for project plan");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(getTestCSVData());
      }, 2000);
    });
  }

  try {
    console.log("Using OpenAI to generate project plan");
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
I'm planning a project and need a detailed CSV file in the format required by TeamGantt for upload. Please create a Work Breakdown Structure (WBS) for this project, including all necessary phases, groups, and tasks. Each item should have appropriate start and end dates, beginning from today, and reflect a realistic timeline for the project.

The CSV columns are as follows:

WBS #,Name / Title,Type,Start Date,End Date

Here is an example for reference:

WBS #,Name / Title,Type,Start Date,End Date
1,"[Project Name]",project,YYYY-MM-DD,YYYY-MM-DD
1.1,"[Phase/Group 1]",group,YYYY-MM-DD,YYYY-MM-DD
1.1.1,"[Task 1]",task,YYYY-MM-DD,YYYY-MM-DD
1.1.2,"[Task 2]",task,YYYY-MM-DD,YYYY-MM-DD
…
1.2,"[Phase/Group 2]",group,YYYY-MM-DD,YYYY-MM-DD
1.2.1,"[Task 1]",task,YYYY-MM-DD,YYYY-MM-DD
…

Ensure that the project is broken down into robust, detailed groups and tasks with realistic durations.

Don't explain what you're doing, only respond with text in the CSV format.

Project Description:
${description}
            `,
        },
      ],
      model: "gpt-4o-mini",
    });

    const response = completion.choices[0].message.content;

    console.log("OpenAI response:", response);

    const result = cleanupGPTResponse(response);

    console.log("Cleaned response:", result);

    return result;
  } catch (error) {
    console.error("Error generating project plan:", error);
    throw new Error("Failed to generate project plan");
  }
}

export function cleanupGPTResponse(response: string | null): string {
  if (!response) {
    throw new Error("response is null or empty");
  }

  // Remove surrounding ``` and leading/trailing whitespace
  const cleaned = response.replace(/^```/, "").replace(/```$/, "").trim();

  return cleaned;
}

function getTestCSVData() {
  return Promise.resolve(`WBS,Name,Type,Start Date,End Date
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
