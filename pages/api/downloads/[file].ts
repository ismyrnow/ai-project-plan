import { NextApiRequest, NextApiResponse } from "next";
import { promises as fsPromises } from "fs";
import path from "path";
import fs from "fs";

/**
 * Stream csv files from the downloads folder
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fileName = req.query.file as string;
  const filePath = path.join("downloads", fileName);

  console.log("Handling download request: ", fileName);

  try {
    const stats = await fsPromises.stat(filePath);

    res.writeHead(200, {
      "Content-Disposition": `attachment; filename=${path.basename(filePath)}`,
      // Any file in this folder will be streamed, but since we only save CSV files here,
      // we are taking a shortcut and setting the content type to CSV.
      "Content-Type": "text/csv",
      "Content-Length": stats.size,
    });

    await new Promise(function (resolve) {
      fs.createReadStream(filePath).pipe(res).on("end", resolve);
    });
  } catch (err) {
    console.log("File not found:", filePath);
    res.status(404).end("File not found");
    return;
  }
}
