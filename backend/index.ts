
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import generateTestRouter from "./generateTest";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://reactestcasegenerator.s3.eu-north-1.amazonaws.com',
    'https://reactestcasegenerator.s3-website.eu-north-1.amazonaws.com', // if using website endpoint
    'http://localhost:3000' // for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/api/generate-test", generateTestRouter);

app.get("/", (_, res) => res.send("API running"));



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

