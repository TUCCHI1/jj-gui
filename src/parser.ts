import type { Commit } from "./types";

const getBranches = (bookmarks: string): string[] => {
  const trimmed = bookmarks.trim();
  if (!trimmed) return [];
  return trimmed.split(" ").filter(Boolean);
};

type RawParts = {
  id: string;
  bookmarks: string;
  author: string;
  date: string;
  message: string;
  isWorking: string;
  isImmutable: string;
};

const REQUIRED_PARTS = 7;

const hasAllParts = (parts: string[]): parts is [string, string, string, string, string, string, string] =>
  parts.length >= REQUIRED_PARTS && parts.slice(0, REQUIRED_PARTS).every(Boolean);

const extractParts = (line: string): RawParts | undefined => {
  const parts = line.split("|");
  if (!hasAllParts(parts)) return undefined;
  return {
    id: parts[0],
    bookmarks: parts[1],
    author: parts[2],
    date: parts[3],
    message: parts[4],
    isWorking: parts[5],
    isImmutable: parts[6],
  };
};

const buildCommit = (raw: RawParts): Commit => ({
  id: raw.id.trim(),
  author: raw.author.trim(),
  date: raw.date.trim(),
  message: raw.message.trim(),
  isWorking: raw.isWorking.trim() === "working",
  isImmutable: raw.isImmutable.trim() === "immutable",
  branches: getBranches(raw.bookmarks),
});

// Parse structured log format: CHANGE_ID|BOOKMARKS|AUTHOR|DATE|DESCRIPTION|IS_WORKING|IS_IMMUTABLE
const parseLine = (line: string): Commit | undefined => {
  const raw = extractParts(line);
  if (!raw || raw.id.length < 4) return undefined;
  return buildCommit(raw);
};

export const parseJjLog = (log: string): Commit[] => {
  const lines = log.split("\n").filter((line) => line.trim() && line.includes("|"));
  return lines.map((line) => parseLine(line)).filter((c): c is Commit => c !== undefined);
};
