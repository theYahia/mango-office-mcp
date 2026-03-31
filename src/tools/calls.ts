import { z } from "zod";
import { mangoPost } from "../client.js";

export const getCallsSchema = z.object({
  date_from: z.string().describe("Начало периода (UNIX timestamp или ISO 8601)"),
  date_to: z.string().describe("Конец периода (UNIX timestamp или ISO 8601)"),
  limit: z.number().int().min(1).max(1000).default(100).describe("Количество записей"),
});

export async function handleGetCalls(params: z.infer<typeof getCallsSchema>): Promise<string> {
  const result = await mangoPost("stats/request", {
    date_from: params.date_from,
    date_to: params.date_to,
    limit: params.limit,
  });
  return JSON.stringify(result, null, 2);
}

export const getUsersSchema = z.object({
  limit: z.number().int().min(1).max(1000).default(100).describe("Количество пользователей"),
});

export async function handleGetUsers(params: z.infer<typeof getUsersSchema>): Promise<string> {
  const result = await mangoPost("config/users/request", {
    limit: params.limit,
  });
  return JSON.stringify(result, null, 2);
}
