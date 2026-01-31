export type Commit = {
  id: string;
  author: string;
  date: string;
  message: string;
  isWorking: boolean;
  isImmutable: boolean;
  branches: string[];
};

export type ColumnWidths = {
  change: number;
  branches: number;
  description: number;
  author: number;
};

export type AppState = {
  currentRepoPath: string | undefined;
  commits: Commit[];
  selectedCommitId: string | undefined;
};

export type ResizeState = {
  resizing: boolean;
  currentCol: keyof ColumnWidths | undefined;
  startX: number;
  startWidth: number;
};
