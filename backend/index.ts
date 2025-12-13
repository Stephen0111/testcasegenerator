
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import generateTestRouter from "./generateTest";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/generate-test", generateTestRouter);

app.get("/", (_, res) => res.send("API running"));



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

