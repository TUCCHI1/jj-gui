import { test, expect } from "@playwright/test";
import { tauriMockScript, mockJjLog } from "./tauri-mock";

test.describe("UI Layout Stability", () => {
  test.beforeEach(async ({ page }) => {
    // Inject Tauri mock before page loads
    await page.addInitScript(tauriMockScript());
    await page.goto("/");
  });

  test("initial render matches snapshot", async ({ page }) => {
    await expect(page).toHaveScreenshot("initial.png", {
      maxDiffPixels: 100,
    });
  });

  test("open-repo button hover does not shift layout", async ({ page }) => {
    const button = page.locator("#open-repo");
    const beforeBox = await button.boundingBox();

    await button.hover();
    await page.waitForTimeout(200);

    const afterBox = await button.boundingBox();

    expect(afterBox?.x).toBe(beforeBox?.x);
    expect(afterBox?.y).toBe(beforeBox?.y);
    expect(afterBox?.width).toBe(beforeBox?.width);
    expect(afterBox?.height).toBe(beforeBox?.height);
  });

  test("screenshot button hover does not shift layout", async ({ page }) => {
    const button = page.locator("#screenshot-btn");
    const beforeBox = await button.boundingBox();

    await button.hover();
    await page.waitForTimeout(200);

    const afterBox = await button.boundingBox();

    expect(afterBox?.x).toBe(beforeBox?.x);
    expect(afterBox?.y).toBe(beforeBox?.y);
    expect(afterBox?.width).toBe(beforeBox?.width);
    expect(afterBox?.height).toBe(beforeBox?.height);
  });

  test("sidebar hover state screenshot", async ({ page }) => {
    await page.locator("#open-repo").hover();
    await expect(page.locator("#sidebar")).toHaveScreenshot("sidebar-hover.png", {
      maxDiffPixels: 100,
    });
  });
});

test.describe("Empty State", () => {
  test("shows empty state without repository", async ({ page }) => {
    await page.addInitScript(tauriMockScript());
    await page.goto("/");
    await expect(page.locator("#log .empty")).toBeVisible();
    await expect(page.locator("#log")).toHaveScreenshot("empty-state.png", {
      maxDiffPixels: 100,
    });
  });
});

test.describe("Repository Persistence", () => {
  test("restores last opened repository on reload", async ({ page }) => {
    // First, open a repository
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");
    await page.locator("#open-repo").click();
    await expect(page.locator(".commit-row")).toHaveCount(3);

    // Reload the page (localStorage persists)
    await page.reload();

    // Should automatically load the last repo
    await expect(page.locator(".commit-row")).toHaveCount(3);
    await expect(page.locator("#repo-name")).toHaveText("repo");
  });
});

test.describe("Repository Open", () => {
  test("can open repository and display commits", async ({ page }) => {
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");

    // Click open repository button
    await page.locator("#open-repo").click();

    // Wait for commits to load
    await expect(page.locator(".commit-row")).toHaveCount(3);

    // Verify repo name is displayed
    await expect(page.locator("#repo-name")).toHaveText("repo");
  });

  test("displays commit information correctly", async ({ page }) => {
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");
    await page.locator("#open-repo").click();

    // Check first commit
    const firstRow = page.locator(".commit-row").first();
    await expect(firstRow.locator(".commit-id")).toHaveText("qpvuntsm");
    await expect(firstRow.locator(".commit-message")).toContainText("Initial commit");
  });

  test("commit row hover does not shift layout", async ({ page }) => {
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");
    await page.locator("#open-repo").click();

    const row = page.locator(".commit-row").first();
    const beforeBox = await row.boundingBox();

    await row.hover();
    await page.waitForTimeout(200);

    const afterBox = await row.boundingBox();

    expect(afterBox?.x).toBe(beforeBox?.x);
    expect(afterBox?.y).toBe(beforeBox?.y);
    expect(afterBox?.width).toBe(beforeBox?.width);
    expect(afterBox?.height).toBe(beforeBox?.height);
  });

  test("clicking commit opens detail panel", async ({ page }) => {
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");
    await page.locator("#open-repo").click();

    // Detail panel should be hidden initially
    await expect(page.locator("#detail-panel")).toHaveClass(/hidden/);

    // Click on a commit
    await page.locator(".commit-row").first().click();

    // Detail panel should be visible
    await expect(page.locator("#detail-panel")).not.toHaveClass(/hidden/);
    await expect(page.locator("#detail-id")).toHaveText("qpvuntsm");
  });

  test("repository view matches snapshot", async ({ page }) => {
    await page.addInitScript(tauriMockScript({ repoPath: "/test/repo", jjLog: mockJjLog }));
    await page.goto("/");
    await page.locator("#open-repo").click();

    await expect(page).toHaveScreenshot("repo-view.png", {
      maxDiffPixels: 100,
    });
  });
});
