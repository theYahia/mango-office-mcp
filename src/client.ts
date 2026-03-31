import { createHmac } from "node:crypto";

const BASE_URL = "https://app.mango-office.ru/vpbx";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;

function sign(apiKey: string, apiSalt: string, jsonBody: string): string {
  return createHmac("sha256", apiSalt).update(apiKey + jsonBody + apiSalt).digest("hex");
}

export async function mangoPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const apiKey = process.env.MANGO_API_KEY;
  const apiSalt = process.env.MANGO_API_SALT;
  if (!apiKey || !apiSalt) throw new Error("MANGO_API_KEY и MANGO_API_SALT не заданы");

  const jsonBody = JSON.stringify(body);
  const signature = sign(apiKey, apiSalt, jsonBody);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const formData = new URLSearchParams();
    formData.set("vpbx_api_key", apiKey);
    formData.set("sign", signature);
    formData.set("json", jsonBody);

    try {
      const response = await fetch(`${BASE_URL}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        return await response.json();
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[mango-office-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`Mango Office HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[mango-office-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Mango Office API: все попытки исчерпаны");
}
