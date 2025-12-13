export function extractFunctionsGeneric(code: string) {
    const regex = /(function|def)\s+([a-zA-Z0-9_]+)/g;
    const results = [];
  
    let match;
    while ((match = regex.exec(code))) {
      results.push({ name: match[2] });
    }
  
    return results;
  }
  