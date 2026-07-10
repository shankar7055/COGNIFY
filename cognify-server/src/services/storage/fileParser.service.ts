import fs from "fs";
import path from "path";
import { logger } from "../../config/logger";

async function parsePdf(filePath: string): Promise<string> {
  // Use require-style import to bypass ESM default export issue
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require("pdf-parse");
  const buffer   = fs.readFileSync(filePath);
  const data     = await pdfParse(buffer);
  return data.text.trim();
}

async function parseCsv(filePath: string): Promise<string> {
  const csvParser = (await import("csv-parser")).default;

  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: Record<string, string>) => rows.push(row))
      .on("end", () => {
        const text = rows
          .map((row) =>
            Object.entries(row)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
          )
          .join("\n");
        resolve(text);
      })
      .on("error", reject);
  });
}

function parsePlainText(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8").trim();
}

export const fileParserService = {
  async parse(filePath: string, mimetype: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    logger.info(`Parsing file: ${filePath} (${mimetype})`);

    try {
      if (mimetype === "application/pdf" || ext === ".pdf") {
        return await parsePdf(filePath);
      }

      if (mimetype === "text/csv" || ext === ".csv") {
        return await parseCsv(filePath);
      }

      if (
        mimetype.startsWith("text/") ||
        ext === ".txt" ||
        ext === ".md" ||
        ext === ".json" ||
        ext === ".xml"
      ) {
        return parsePlainText(filePath);
      }

      logger.warn(`Unsupported file type for parsing: ${mimetype}`);
      return "";
    } catch (err) {
      logger.error(`Failed to parse file ${filePath}`, { err });
      return "";
    }
  },

  chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      chunks.push(text.slice(start, start + chunkSize));
      start += chunkSize - overlap;
    }

    return chunks;
  },
};
