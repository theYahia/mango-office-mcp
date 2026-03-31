#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getCallsSchema, handleGetCalls, getUsersSchema, handleGetUsers } from "./tools/calls.js";

const server = new McpServer({
  name: "mango-office-mcp",
  version: "1.0.0",
});

server.tool(
  "get_calls",
  "Получить историю звонков Mango Office за период.",
  getCallsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetCalls(params) }] }),
);

server.tool(
  "get_users",
  "Получить список пользователей Mango Office.",
  getUsersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetUsers(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mango-office-mcp] Сервер запущен. 2 инструмента. Требуется MANGO_API_KEY + MANGO_API_SALT.");
}

main().catch((error) => {
  console.error("[mango-office-mcp] Ошибка:", error);
  process.exit(1);
});
