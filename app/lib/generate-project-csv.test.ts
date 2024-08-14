import type OpenAI from "openai";
import generateProjectCSV, {
  cleanupGPTResponse,
} from "../lib/generate-project-csv";

jest.useFakeTimers();

describe("cleanupGPTResponse", () => {
  it("should throw an error if response is blank or null", () => {
    const response = null;

    expect(() => {
      const cleanedResponse = cleanupGPTResponse(response);
    }).toThrow("response is null or empty");
  });

  it("should remove any leading or trailing whitespace from the response", () => {
    const response = "   This is a test response.   ";
    const cleanedResponse = cleanupGPTResponse(response);
    expect(cleanedResponse).toBe("This is a test response.");
  });

  it("should remove backticks surrounding the response", () => {
    const response = "```\nThis is a test\nresponse.\n```";
    const cleanedResponse = cleanupGPTResponse(response);
    expect(cleanedResponse).toBe("This is a test\nresponse.");
  });
});

describe("generateProjectCSV", () => {
  it("should use test data if openai is not configured", async () => {
    const description = "Test project description";

    const promise = generateProjectCSV(description, null);
    jest.runAllTimers();

    expect(promise).resolves.toBe(`WBS,Name,Type,Start Date,End Date
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
  });

  it("should generate a project CSV from a project description", async () => {
    const description = "Test project description";
    const csv = await generateProjectCSV(
      description,
      getMockedOpenAI("Test response")
    );

    expect(csv).toBe("Test response");
  });

  it("should handle empty response from openai", async () => {
    const description = "Test project description";

    expect(async () => {
      const csv = await generateProjectCSV(description, getMockedOpenAI(null));
    }).rejects.toThrow("Failed to generate project plan");
  });
});

function getMockedOpenAI(responseContent: any): OpenAI {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: responseContent,
              },
            },
          ],
        }),
      },
    },
  } as any;
}
