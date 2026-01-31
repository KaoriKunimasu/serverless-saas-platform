import express from 'express';
import cors from 'cors';


const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`b-api listening on port ${port}`);
});

