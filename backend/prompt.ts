export function buildPrompt(
    code: string,
    language: string,
    framework: string,
    functions: { name: string }[]
  ) {
    return `
  You are a  ${language} test engineer.
  
  Detected functions:
  ${functions.map(f => `- ${f.name}`).join("\n")}
  
  Write high-quality ${framework} tests for each function.
  Include:
  - happy paths
  - edge cases
  - invalid inputs
  - error handling
  
  Return results grouped per function.
  Only output test code.
  `;
  }
  