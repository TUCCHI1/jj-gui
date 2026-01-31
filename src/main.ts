import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { Commit, AppState } from "./types";
import { parseJjLog } from "./parser";
import { buildCommitHtml, buildEmptyStateHtml, buildErrorHtml, buildBranchHtml } from "./html";
import { setupColumnResize } from "./column-resize";
import { saveLastRepo, loadLastRepo } from "./storage";

const logElement = document.querySelector("#log");
const repoNameElement = document.querySelector("#repo-name");
const branchesElement = document.querySelector("#branches");
const openRepoButton = document.querySelector("#open-repo");
const detailPanel = document.querySelector("#detail-panel");
const closeDetailButton = document.querySelector("#close-detail");
const saveMessageButton = document.querySelector("#save-message");
const detailMessageInput = document.querySelector<HTMLTextAreaElement>("#detail-message");
const mainElement = document.querySelector<HTMLElement>("#main");
const logHeader = document.querySelector<HTMLElement>("#log-header");

const state: AppState = {
  currentRepoPath: undefined,
  commits: [],
  selectedCommitId: undefined,
};

const clearSelection = () => {
  for (const r of document.querySelectorAll(".commit-row")) {
    r.classList.remove("selected");
  }
};

const setTextContent = (selector: string, text: string) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
};

const updateDetailElements = (commit: Commit) => {
  setTextContent("#detail-id", commit.id);
  setTextContent("#detail-author", commit.author || "Unknown");
  setTextContent("#detail-date", commit.date || "Unknown");
  if (detailMessageInput) detailMessageInput.value = commit.message || "";
};

const showDetail = (commit: Commit) => {
  state.state.selectedCommitId = commit.id;
  updateDetailElements(commit);
  detailPanel?.classList.remove("hidden");
};

const handleCommitClick = (row: HTMLElement) => {
  const id = row.dataset.id;
  const commit = state.commits.find((c) => c.id === id);
  if (commit) showDetail(commit);
  clearSelection();
  row.classList.add("selected");
};

const attachCommitClickHandlers = () => {
  for (const row of document.querySelectorAll<HTMLElement>(".commit-row")) {
    row.addEventListener("click", () => handleCommitClick(row));
  }
};

const renderCommits = () => {
  if (!logElement) return;
  if (state.commits.length === 0) {
    logElement.innerHTML = '<div class="empty">No state.commits</div>';
    return;
  }
  const html = state.commits.map((commit, index) => buildCommitHtml(commit, index, state.commits.length)).join("");
  logElement.innerHTML = html;
  attachCommitClickHandlers();
};

const updateSaveButtonText = (text: string) => {
  if (saveMessageButton) saveMessageButton.textContent = text;
};

const resetSaveButtonLater = () => {
  setTimeout(() => updateSaveButtonText("Save"), 1500);
};

const updateLocalCommitMessage = (commitId: string, message: string) => {
  const commit = state.commits.find((c) => c.id === commitId);
  if (commit) commit.message = message;
};

const handleSaveSuccess = (commitId: string, message: string) => {
  updateLocalCommitMessage(commitId, message);
  renderCommits();
  updateSaveButtonText("Saved!");
  resetSaveButtonLater();
};

const handleSaveError = (error: unknown) => {
  alert(`Failed to save: ${error}`);
  updateSaveButtonText("Save");
};

const saveDescription = async () => {
  if (!state.currentRepoPath || !state.selectedCommitId || !detailMessageInput) return;
  const newMessage = detailMessageInput.value;
  updateSaveButtonText("Saving...");
  try {
    await invoke("jj_describe", { repoPath: state.currentRepoPath, revision: state.selectedCommitId, message: newMessage });
    handleSaveSuccess(state.selectedCommitId, newMessage);
  } catch (error) {
    handleSaveError(error);
  }
};

const collectBranches = (): Set<string> =>
  new Set(state.commits.flatMap((commit) => commit.branches));

const renderBranches = () => {
  if (!branchesElement) return;
  const allBranches = collectBranches();
  if (allBranches.size === 0) {
    branchesElement.innerHTML = buildBranchHtml("main");
    return;
  }
  branchesElement.innerHTML = [...allBranches].map((b) => buildBranchHtml(b)).join("");
};

const updateRepoName = () => {
  if (!repoNameElement || !state.currentRepoPath) return;
  repoNameElement.textContent = state.currentRepoPath.split("/").pop() ?? state.currentRepoPath;
  repoNameElement.title = state.currentRepoPath;
};

const showEmptyState = () => {
  if (logElement) logElement.innerHTML = buildEmptyStateHtml();
};

const showError = (error: unknown) => {
  if (logElement) logElement.innerHTML = buildErrorHtml(String(error));
};

const fetchAndDisplayLog = async () => {
  if (!state.currentRepoPath) return;
  const log = await invoke<string>("get_jj_log", { repoPath: state.currentRepoPath });
  state.commits = parseJjLog(log);
  renderCommits();
  renderBranches();
};

const displayLog = async () => {
  if (!state.currentRepoPath) {
    showEmptyState();
    return;
  }
  updateRepoName();
  try {
    await fetchAndDisplayLog();
  } catch (error) {
    showError(error);
  }
};

const openRepository = async () => {
  const selected = await open({ directory: true, multiple: false, title: "Open jj Repository" });
  if (!selected || typeof selected !== "string") return;
  state.currentRepoPath = selected;
  saveLastRepo(selected);
  detailPanel?.classList.add("hidden");
  await displayLog();
};

const closeDetail = () => {
  detailPanel?.classList.add("hidden");
  state.selectedCommitId = undefined;
  clearSelection();
};

const setScreenshotButtonText = (text: string) => {
  const button = document.querySelector("#screenshot-btn");
  if (button) button.textContent = text;
};

const takeScreenshot = async () => {
  setScreenshotButtonText("📸 Capturing...");
  try {
    const path = await invoke<string>("take_screenshot");
    setScreenshotButtonText(`📸 ${path}`);
    alert(`Screenshot saved: ${path}`);
  } catch (error) {
    alert(`Screenshot failed: ${error}`);
    setScreenshotButtonText("📸 Debug");
  }
};

// Event listeners
openRepoButton?.addEventListener("click", openRepository);
closeDetailButton?.addEventListener("click", closeDetail);
saveMessageButton?.addEventListener("click", saveDescription);
document.querySelector("#screenshot-btn")?.addEventListener("click", takeScreenshot);

// Column resize
if (mainElement && logHeader) {
  setupColumnResize(mainElement, logHeader);
}

// Restore last opened repository
const lastRepo = loadLastRepo();
if (lastRepo) {
  state.currentRepoPath = lastRepo;
}

displayLog();
