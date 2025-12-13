import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export interface ExtractedFunction {
  name: string;
  startLine: number;
  endLine: number;
}

export function extractFunctionsJS(code: string): ExtractedFunction[] {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const functions: ExtractedFunction[] = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      const { node } = path;
      if (!node.id) return;

      functions.push({
        name: node.id.name,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
      });
    },
  });

  return functions;
}
