import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'Game Service is healthy!' });
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`🚀 Game Service is running on: http://localhost:${port}`);
});
