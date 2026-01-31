import type { ColumnWidths } from "./types";

const COLUMN_WIDTHS_KEY = "jj-gui:column-widths";

const defaultWidths: ColumnWidths = {
  change: 80,
  branches: 120,
  description: 400,
  author: 150,
};

const parseColumnWidths = (saved: string): ColumnWidths => {
  try {
    return { ...defaultWidths, ...JSON.parse(saved) };
  } catch {
    return defaultWidths;
  }
};

const loadColumnWidths = (): ColumnWidths => {
  const saved = localStorage.getItem(COLUMN_WIDTHS_KEY);
  if (!saved) return defaultWidths;
  return parseColumnWidths(saved);
};

const saveColumnWidths = (widths: ColumnWidths) => {
  localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(widths));
};

const applyColumnWidths = (mainElement: HTMLElement, widths: ColumnWidths) => {
  mainElement.style.setProperty("--col-change", `${widths.change}px`);
  mainElement.style.setProperty("--col-branches", `${widths.branches}px`);
  mainElement.style.setProperty("--col-description", `${widths.description}px`);
  mainElement.style.setProperty("--col-author", `${widths.author}px`);
};

export const setupColumnResize = (mainElement: HTMLElement, logHeader: HTMLElement) => {
  const columnWidths = loadColumnWidths();
  applyColumnWidths(mainElement, columnWidths);

  let resizing = false;
  let currentCol: keyof ColumnWidths | undefined;
  let startX = 0;
  let startWidth = 0;

  const isColumnKey = (value: string | undefined): value is keyof ColumnWidths =>
    value !== undefined && value in columnWidths;

  const handleMouseDown = (event_: MouseEvent) => {
    const target = event_.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("resize-handle")) return;

    const col = target.dataset.col;
    if (!isColumnKey(col)) return;

    resizing = true;
    currentCol = col;
    startX = event_.clientX;
    startWidth = columnWidths[col];

    logHeader.classList.add("resizing");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    event_.preventDefault();
  };

  const handleMouseMove = (event_: MouseEvent) => {
    if (!resizing || !currentCol) return;

    const diff = event_.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff);

    columnWidths[currentCol] = newWidth;
    applyColumnWidths(mainElement, columnWidths);
  };

  const handleMouseUp = () => {
    if (!resizing) return;

    resizing = false;
    currentCol = undefined;
    logHeader.classList.remove("resizing");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    saveColumnWidths(columnWidths);
  };

  logHeader.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};
