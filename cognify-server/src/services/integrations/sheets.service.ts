import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

async function getAccessToken(): Promise<string> {
  // JWT-based service account auth
  const jwt = await import("jsonwebtoken");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss:   env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  };

  const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

  const res = await axios.post("https://oauth2.googleapis.com/token", {
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: token,
  });

  return res.data.access_token;
}

export const sheetsService = {
  /** Read values from a spreadsheet range (e.g. "Sheet1!A1:D10") */
  async readRange(
    spreadsheetId: string,
    range: string
  ): Promise<string[][]> {
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error("Google Sheets credentials not configured");
    }

    const accessToken = await getAccessToken();

    const res = await axios.get(
      `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    logger.info(`Read ${range} from spreadsheet ${spreadsheetId}`);
    return res.data.values ?? [];
  },

  /** Append rows to a spreadsheet */
  async appendRows(
    spreadsheetId: string,
    range: string,
    values: string[][]
  ): Promise<void> {
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error("Google Sheets credentials not configured");
    }

    const accessToken = await getAccessToken();

    await axios.post(
      `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}:append`,
      { values },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params:  { valueInputOption: "USER_ENTERED" },
      }
    );

    logger.info(`Appended ${values.length} rows to ${spreadsheetId}`);
  },

  /** Convert sheet rows to readable text for AI context */
  rowsToText(rows: string[][], headers?: string[]): string {
    if (!rows.length) return "No data found";

    const cols = headers ?? rows[0];
    const data = headers ? rows : rows.slice(1);

    return data
      .map((row) =>
        cols.map((col, i) => `${col}: ${row[i] ?? ""}`).join(", ")
      )
      .join("\n");
  },
};
