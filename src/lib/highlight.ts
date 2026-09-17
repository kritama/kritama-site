const HCL_TOKEN_PATTERN =
  /"(?:\\.|[^"\\])*"|#.*$|\/\/.*$|\b(?:module|resource|data|variable|output|locals|provider)\b|\b\d+(?:\.\d+)*\b|[{}\[\]=,]|\b[a-zA-Z_][\w.-]*\b/g;

const MARKDOWN_TOKEN_PATTERN =
  /^[#]{1,6}\s.*$|^---$|^\s*-\s+|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*/g;

const HCL_KEYWORDS = new Set([
  "module",
  "resource",
  "data",
  "variable",
  "output",
  "locals",
  "provider",
]);

const HCL_PUNCTUATION = new Set(["{", "}", "[", "]", "=", ","]);

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const hclSpan = (className: string, token: string): string =>
  `<span class="hcl-token hcl-${className}">${escapeHtml(token)}</span>`;

const scan = (line: string, pattern: RegExp): Array<[number, string]> => {
  const matches: Array<[number, string]> = [];
  pattern.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    matches.push([match.index, match[0]]);
    if (match[0].length === 0) pattern.lastIndex += 1;
  }

  return matches;
};

const highlightLine = (
  line: string,
  pattern: RegExp,
  highlightToken: (token: string) => string
): string => {
  let html = "";
  let cursor = 0;

  for (const [start, token] of scan(line, pattern)) {
    html += escapeHtml(line.slice(cursor, start));
    html += highlightToken(token);
    cursor = start + token.length;
  }

  return html + escapeHtml(line.slice(cursor));
};

const highlightHclToken = (token: string): string => {
  if (token.startsWith('"')) return hclSpan("string", token);
  if (token.startsWith("#")) return hclSpan("comment", token);
  if (token.startsWith("//")) return hclSpan("comment", token);
  if (HCL_KEYWORDS.has(token)) return hclSpan("keyword", token);
  if (HCL_PUNCTUATION.has(token)) return hclSpan("punctuation", token);
  if (/^\d/.test(token)) return hclSpan("number", token);
  return hclSpan("identifier", token);
};

const highlightMarkdownToken = (token: string): string => {
  if (token.startsWith("#")) return hclSpan("markdown-heading", token);
  if (token === "---") return hclSpan("punctuation", "---");
  if (token.startsWith("-")) return hclSpan("punctuation", token);
  if (token.startsWith("`")) return hclSpan("string", token);
  if (token.startsWith("**")) return hclSpan("markdown-emphasis", token);
  if (token.startsWith("*")) return hclSpan("markdown-emphasis", token);
  return hclSpan("identifier", token);
};

export function highlightHcl(code: string): string {
  return code
    .split("\n")
    .map((line) => highlightLine(line, HCL_TOKEN_PATTERN, highlightHclToken))
    .join("\n");
}

export function highlightMarkdown(code: string): string {
  return code
    .split("\n")
    .map((line) => highlightLine(line, MARKDOWN_TOKEN_PATTERN, highlightMarkdownToken))
    .join("\n");
}
