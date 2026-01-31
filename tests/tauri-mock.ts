// Mock data for testing
// Format: CHANGE_ID|BOOKMARKS|AUTHOR|DATE|DESCRIPTION|IS_WORKING|IS_IMMUTABLE
export const mockCommits = [
  "qpvuntsm|main feature-test|user@example.com|2025-01-30|Initial commit|working|",
  "kkmpptxz||user@example.com|2025-01-29|||",
  "zzzzzzzz||user@example.com|2025-01-28|Root commit||immutable",
];

export const mockJjLog = mockCommits.join("\n");

// Script to inject into the page to mock Tauri APIs
export const tauriMockScript = (options: { repoPath?: string; jjLog?: string } = {}) => {
  const repoPath = options.repoPath ?? "/mock/repo/path";
  const jjLog = options.jjLog ?? "";

  return `
    window.__TAURI_INTERNALS__ = {
      transformCallback: (callback) => {
        const id = Math.random();
        window["_" + id] = callback;
        return id;
      },
      invoke: async (cmd, args) => {
        if (cmd === "plugin:dialog|open") {
          return ${JSON.stringify(repoPath)};
        }
        if (cmd === "get_jj_log") {
          return ${JSON.stringify(jjLog)};
        }
        if (cmd === "jj_describe") {
          return null;
        }
        if (cmd === "take_screenshot") {
          return "/tmp/mock-screenshot.png";
        }
        return null;
      },
    };
  `;
};
