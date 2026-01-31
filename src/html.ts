import type { Commit } from "./types";

export const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const getNodeClass = (commit: Commit): string => {
  if (commit.isWorking) return "working";
  if (commit.isImmutable) return "immutable";
  return "";
};

const getMessageClass = (message: string): string => {
  if (message) return "";
  return "empty";
};

const getGraphLineTop = (isFirst: boolean): string => {
  if (isFirst) return "";
  return '<div class="graph-line top"></div>';
};

const getGraphLineBottom = (isLast: boolean): string => {
  if (isLast) return "";
  return '<div class="graph-line bottom"></div>';
};

export const buildCommitHtml = (commit: Commit, index: number, total: number): string => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const nodeClass = getNodeClass(commit);
  const messageClass = getMessageClass(commit.message);
  const displayMessage = commit.message || "(no description)";
  const branchTags = commit.branches.map((b) => `<span class="commit-branch">${escapeHtml(b)}</span>`).join(" ");

  return `
    <div class="commit-row" data-id="${commit.id}">
      <div class="graph-cell">
        ${getGraphLineTop(isFirst)}
        <div class="node ${nodeClass}"></div>
        ${getGraphLineBottom(isLast)}
      </div>
      <span class="commit-id">${escapeHtml(commit.id)}</span>
      <span class="commit-branches">${branchTags}</span>
      <span class="commit-message ${messageClass}">${escapeHtml(displayMessage)}</span>
      <span class="commit-author">${escapeHtml(commit.author)}</span>
      <span class="commit-date">${escapeHtml(commit.date)}</span>
    </div>
  `;
};

export const buildEmptyStateHtml = (): string => `
  <div class="empty">
    <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9z"/>
    </svg>
    <span>Open a jj repository</span>
  </div>
`;

const getErrorContent = (errorMessage: string): string => {
  const isNotRepo = errorMessage.includes("no jj repo");
  if (isNotRepo) return "Not a jj repository";
  return escapeHtml(errorMessage);
};

export const buildErrorHtml = (errorMessage: string): string =>
  `<div class="error">${getErrorContent(errorMessage)}</div>`;

export const buildBranchHtml = (branch: string): string =>
  `<div class="branch-item">${escapeHtml(branch)}</div>`;
