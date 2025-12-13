
import { Router } from "express";
import { generateTestCases } from "./grok";
import { getOpenAIKey } from "./ssm"; // <-- Import SSM helper

import { extractFunctionsJS } from "./functionExtractor";
import { extractFunctionsGeneric } from "./regexExtractor";
import { buildPrompt } from "./prompt";
import { estimateCoverage } from "./coverageEstimator";
import { splitTestsByFunction } from "./testSplit";

const router = Router();

router.post("/", async (req, res) => {
  const { code, language, framework } = req.body;

  if (!code || !language || !framework) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Fetch OpenAI API key from AWS SSM
    const OPENAI_API_KEY = await getOpenAIKey();

    // Pass API key to generateTestCases
    const tests = await generateTestCases({ code, language, framework, apiKey: OPENAI_API_KEY });

    res.json({ generated_tests: tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate tests" });
  }
});

export default router;
