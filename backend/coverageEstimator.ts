export function estimateCoverage(
    functionCount: number,
    testCount: number
  ) {
    if (functionCount === 0) return "0%";
    return Math.min(100, Math.round((testCount / functionCount) * 100)) + "%";
  }
  