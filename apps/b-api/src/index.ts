import express from 'express';
import cors from 'cors';


const app = express();
const port = Number(process.env.PORT) || 3000;
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3002,http://127.0.0.1:3002')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins }));


app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`b-api listening on port ${port}`);
});

