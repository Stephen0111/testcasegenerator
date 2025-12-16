import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import generateTestRouter from "./generateTest";

const app = express();
const PORT = process.env.PORT || 8080; // Changed from 5000

app.use(cors({
  origin: [
    'https://reactestcasegenerator.s3.eu-north-1.amazonaws.com',
    'https://reactestcasegenerator.s3-website.eu-north-1.amazonaws.com',
    'https://d2xzkwz6nifynl.cloudfront.net',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/api/generate-test", generateTestRouter);

app.get("/", (_, res) => res.send("API running"));
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, '0.0.0.0', () => {  // Fixed syntax
  console.log(`Server running on port ${PORT}`);
});
