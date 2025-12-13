
import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Upload,
  Play,
  Download,
  Copy,
  Check,
  Loader2,
  Moon,
  Sun,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Language = "javascript" | "typescript" | "python" | "java" | "go" | "rust" | "cpp";

const TestCaseGenerator: React.FC = () => {
  const [code, setCode] = useState("// Paste, upload, or drag your code here\n\n");
  const [language, setLanguage] = useState<Language>("javascript");
  const [tests, setTests] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [testFramework, setTestFramework] = useState("jest");
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languageExtensions: Record<Language, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    go: "go",
    rust: "rs",
    cpp: "cpp",
  };

  const testFrameworks: Record<Language, string[]> = {
    javascript: ["jest", "mocha", "jasmine"],
    typescript: ["jest", "mocha", "vitest"],
    python: ["pytest", "unittest", "nose2"],
    java: ["junit", "testng", "spock"],
    go: ["testing", "testify"],
    rust: ["cargo test"],
    cpp: ["gtest", "catch2", "boost.test"],
  };

  const backendURL = "https://test-case-backend-env.eba-3fb3s4ng.eu-north-1.elasticbeanstalk.com/api/generate-test";
  
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        setCode(content);
        setFileName(file.name);
        const ext = file.name.split(".").pop()?.toLowerCase();
        const langMap: Record<string, Language> = {
          js: "javascript",
          ts: "typescript",
          py: "python",
          java: "java",
          go: "go",
          rs: "rust",
          cpp: "cpp",
          cc: "cpp",
          c: "cpp",
        };
        if (ext && langMap[ext]) {
          setLanguage(langMap[ext]);
          setTestFramework(testFrameworks[langMap[ext]][0]);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const generateTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, framework: testFramework }),
      });
      const data = await res.json();

      if (data.generated_tests && typeof data.generated_tests === "object") {
        setTests(data.generated_tests);
      } else if (data.error) {
        setTests({ error: data.error });
      } else {
        setTests({ error: "// Unexpected response from backend" });
      }

      if (outputCollapsed) setOutputCollapsed(false);
    } catch (err) {
      setTests({ error: "// Error generating tests\n// " + ((err as Error).message || "Unknown error") });
    } finally {
      setLoading(false);
    }
  };

  const copyFunctionTests = (funcName: string) => {
    navigator.clipboard.writeText(tests[funcName]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFunctionTests = (funcName: string) => {
    const blob = new Blob([tests[funcName]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = fileName ? fileName.split(".")[0] : "test";
    a.download = `${baseName}.${funcName}.test.${languageExtensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFileName("");
    setCode("// Paste, upload, or drag your code here\n\n");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif", backgroundColor: "#1f1f1f", color: "#eee" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#2a2a2a", borderBottom: "1px solid #444" }}>
        <h1 style={{ color: "#4aa3f0" }}>AI Test Case Generator</h1>
        <button onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}>
          {theme === "vs-dark" ? <Sun /> : <Moon />}
        </button>
      </header>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: 12, backgroundColor: "#2a2a2a", borderBottom: "1px solid #444" }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} accept=".js,.ts,.py,.java,.go,.rs,.cpp,.cc,.c" />
        <button onClick={() => fileInputRef.current?.click()}><Upload /> Upload / Drag</button>
        {fileName && (
          <div>
            {fileName} <button onClick={clearFile}><X /></button>
          </div>
        )}
        <select value={language} onChange={(e) => { setLanguage(e.target.value as Language); setTestFramework(testFrameworks[e.target.value as Language][0]); }}>
          {Object.keys(languageExtensions).map(lang => (<option key={lang} value={lang}>{lang.toUpperCase()}</option>))}
        </select>
        <select value={testFramework} onChange={(e) => setTestFramework(e.target.value)}>
          {testFrameworks[language].map(fw => (<option key={fw} value={fw}>{fw}</option>))}
        </select>
        <button onClick={generateTests} disabled={loading || !code.trim()}>
          {loading ? <Loader2 /> : <Play />} Generate Tests
        </button>
      </div>

      {/* Panels */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #444" }}>
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={code}
            theme={theme}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on"
            }}
          />
        </div>

        {/* Output */}
        <div style={{ width: outputCollapsed ? 40 : "50%", display: "flex", flexDirection: "column", borderLeft: "1px solid #444", backgroundColor: "#1e1e1e", transition: "width 0.3s", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 6, backgroundColor: "#2a2a2a", borderBottom: "1px solid #444", cursor: "pointer" }} onClick={() => setOutputCollapsed(!outputCollapsed)}>
            Generated Tests {outputCollapsed ? <ChevronUp /> : <ChevronDown />}
          </div>
          {!outputCollapsed && (
            <>
              {Object.keys(tests).length === 0 && <div style={{ padding: 12 }}>No tests generated yet.</div>}

              {/* Show error if exists */}
              {tests.error && (
                <div style={{ margin: 8, padding: 12, border: "1px solid #f00", borderRadius: 4, backgroundColor: "#3a1a1a", color: "#f88", whiteSpace: "pre-wrap" }}>
                  {tests.error}
                </div>
              )}

              {/* Render function tests */}
              {Object.entries(tests)
                .filter(([funcName]) => funcName !== "error")
                .map(([funcName, testCode]) => (
                  <div key={funcName} style={{ margin: 8, border: "1px solid #555", borderRadius: 4, backgroundColor: "#2a2a2a", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 6, cursor: "pointer", backgroundColor: "#3a3a3a" }}>
                      <strong>{funcName}</strong>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => copyFunctionTests(funcName)}>
                          {copied ? <><Check /> Copied</> : <><Copy /> Copy</>}
                        </button>
                        <button onClick={() => downloadFunctionTests(funcName)}><Download /> Download</button>
                      </div>
                    </div>
                    <div style={{ padding: 6, display: "flex", flexDirection: "column", flex: 1, minHeight: 150 }}>
                      <Editor
                        height="100%"
                        width="100%"
                        language={language}
                        value={testCode}
                        theme={theme}
                        options={{ readOnly: true, fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: "on" }}
                      />
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 8, backgroundColor: "#4aa3f0", color: "#fff", fontSize: 12 }}>
        <div>Language: {language.toUpperCase()} | Framework: {testFramework} | Lines: {code.split("\n").length}</div>
        <div>Ready</div>
      </footer>
    </div>
  );
};

export default TestCaseGenerator;
