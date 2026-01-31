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
