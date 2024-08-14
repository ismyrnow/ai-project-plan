import fs from "fs";
import path from "path";

export default async function saveCSV(csvData: string) {
  try {
    const fileName = generateFileName();

    return saveFileToDownloads(fileName, csvData);
  } catch (error) {
    console.error("Error saving CSV file:", error);
    throw new Error("Failed to save CSV file");
  }
}

function generateFileName() {
  const date = new Date().toISOString().substring(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `project-plan-${date}-${random}.csv`;

  return fileName;
}

async function saveFileToDownloads(fileName: string, data: string) {
  const filePath = path.join(process.cwd(), "downloads", fileName);
  const publicUrl = `/downloads/${fileName}`;

  await fs.promises.writeFile(filePath, data);

  console.log("Saved to downloads:", publicUrl);

  return publicUrl;
}
