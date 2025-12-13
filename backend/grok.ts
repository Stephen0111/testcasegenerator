
import OpenAI from "openai";

interface GenerateTestInput {
  code: string;
  language: string;
  framework: string;
  apiKey: string; // <-- Add apiKey here
}

// Returns a map of functionName => testCode
export async function generateTestCases({
  code,
  language,
  framework,
  apiKey,
}: GenerateTestInput): Promise<Record<string, string>> {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required but not provided.");
  }

  const client = new OpenAI({ apiKey });

  const prompt = `
You are an expert software test engineer.

TASK:
1. Analyze the following ${language} code.
2. Identify ALL functions, methods, or public APIs that:
   - return values
   - produce observable behavior
3. Generate comprehensive unit tests using ${framework}.
4. Create separate test blocks per function.
5. Include:
   - happy paths
   - edge cases
   - invalid inputs
6. Do NOT explain anything.
7. Output ONLY valid ${framework} test code.
8. Wrap each function's tests in a JSON object like:
   {
     "functionName1": "<test code>",
     "functionName2": "<test code>"
   }

CODE:
${code}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You generate professional-quality unit tests." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const raw = response.choices[0].message?.content?.trim() ?? "";

  // Try parsing JSON from AI response
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    return { error: raw };
  } catch (err) {
    // If AI returned non-JSON text, put it under "error"
    return { error: raw };
  }
}
