#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getCallsSchema, handleGetCalls,
  getUsersSchema, handleGetUsers,
  makeCallSchema, handleMakeCall,
  getStatsSchema, handleGetStats,
  getRecordingSchema, handleGetRecording,
  sendSmsSchema, handleSendSms,
} from "./tools/calls.js";
import { skillCallHistory, skillStats } from "./skills/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mango-office-mcp",
    version: "1.1.0",
  });

  // --- Tools (6) ---

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

  server.tool(
    "make_call",
    "Инициировать исходящий звонок (callback) через Mango Office.",
    makeCallSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleMakeCall(params) }] }),
  );

  server.tool(
    "get_stats",
    "Получить сводную статистику звонков за период.",
    getStatsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetStats(params) }] }),
  );

  server.tool(
    "get_recording",
    "Получить ссылку на запись разговора.",
    getRecordingSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetRecording(params) }] }),
  );

  server.tool(
    "send_sms",
    "Отправить SMS через Mango Office.",
    sendSmsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSendSms(params) }] }),
  );

  // --- Skills (2) ---

  server.tool(
    "skill_call_history",
    "История звонков за сегодня — готовый отчёт.",
    {},
    async () => ({ content: [{ type: "text", text: await skillCallHistory() }] }),
  );

  server.tool(
    "skill_stats",
    "Статистика звонков за сегодня — сводка.",
    {},
    async () => ({ content: [{ type: "text", text: await skillStats() }] }),
  );

  return server;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--http")) {
    const { StreamableHTTPServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    const http = await import("node:http");

    const port = Number(process.env.PORT) || 3000;

    const httpServer = http.createServer(async (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: 8 }));
        return;
      }

      if (req.url === "/mcp") {
        const server = createServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404);
      res.end("Not Found");
    });

    httpServer.listen(port, () => {
      console.error(`[mango-office-mcp] HTTP server on port ${port}. POST /mcp, GET /health`);
    });
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[mango-office-mcp] Сервер запущен (stdio). 8 инструментов. Требуется MANGO_API_KEY + MANGO_API_SALT.");
  }
}

main().catch((error) => {
  console.error("[mango-office-mcp] Ошибка:", error);
  process.exit(1);
});
