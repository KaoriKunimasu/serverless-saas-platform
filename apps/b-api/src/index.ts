import express from "express";
import cors from "cors";
import { Client } from "pg";

const app = express();
const port = Number(process.env.PORT) || 3000;

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3002,http://127.0.0.1:3002")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// CPU burn endpoint for autoscaling test
app.get("/burn", (req, res) => {
  const msRaw = req.query.ms;
  const ms = Math.max(0, Math.min(5000, Number(msRaw ?? 300))); // 0〜5000msに制限

  const start = Date.now();
  // busy loop to consume CPU
  while (Date.now() - start < ms) {
    // some CPU work
    Math.sqrt(Math.random() * 1e6);
  }

  res.status(200).json({ status: "ok", burnedMs: ms });
});

// DB connectivity check (simple TCP + auth)
app.get("/db-check", async (_req, res) => {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const portStr = process.env.DB_PORT;

  
  if (!host || !user || !password || !database || !portStr) {
    return res.status(500).json({
      status: "error",
      message: "missing db env",
      missing: {
        DB_HOST: !host,
        DB_USER: !user,
        DB_PASSWORD: !password,
        DB_NAME: !database,
        DB_PORT: !portStr,
      },
    });
  }

const dbPort = Number(portStr);

const client = new Client({
  host,
  user,
  password,
  database,
  port: dbPort,
  ssl: { rejectUnauthorized: false },
});


  try {
    await client.connect();
    const r = await client.query("SELECT 1 as ok");
    return res.status(200).json({ status: "ok", result: r.rows?.[0] ?? null });
  } catch (e: any) {
    return res.status(500).json({ status: "error", message: e?.message ?? "db failed" });
  } finally {
    try { await client.end(); } catch {}
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`b-api listening on port ${port}`);
});
