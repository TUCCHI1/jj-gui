import type { Commit } from "./types";

const getBranches = (bookmarks: string): string[] => {
  const trimmed = bookmarks.trim();
  if (!trimmed) return [];
  return trimmed.split(" ").filter(Boolean);
};

// Parse structured log format: CHANGE_ID|BOOKMARKS|AUTHOR|DATE|DESCRIPTION|IS_WORKING|IS_IMMUTABLE
const parseLine = (line: string): Commit | undefined => {
  const parts = line.split("|");
  if (parts.length < 7) return undefined;

  const [id, bookmarks, author, date, message, isWorking, isImmutable] = parts;
  if (!id || id.length < 4) return undefined;

  return {
    id: id.trim(),
    author: author.trim(),
    date: date.trim(),
    message: message.trim(),
    isWorking: isWorking.trim() === "working",
    isImmutable: isImmutable.trim() === "immutable",
    branches: getBranches(bookmarks),
  };
};

export const parseJjLog = (log: string): Commit[] => {
  const lines = log.split("\n").filter((line) => line.trim() && line.includes("|"));
  return lines.map((line) => parseLine(line)).filter((c): c is Commit => c !== undefined);
};
