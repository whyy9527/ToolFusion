import { createServer } from "http";

// 🌱 PoC: always respond "Hello ToolRuntime" as SSE or plain text
createServer((req, res) => {
  if (req.method === "POST" && req.url === "/v1/tool-invoke") {
    console.log("Received POST /v1/tool-invoke"); // Add logging
    res.writeHead(200, {
      "Content-Type": "text/event-stream", // Keep SSE for now as per doc
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const responseData = `data: Hello ToolRuntime\n\n`;
    console.log(`Sending response: ${responseData}`); // Add logging
    res.write(responseData);
    res.end();
  } else {
    console.log(`Received ${req.method} ${req.url} - returning 404`); // Add logging
    res.writeHead(404);
    res.end();
  }
}).listen(7078, () => console.log("Mock runtime PoC on :7078"));
