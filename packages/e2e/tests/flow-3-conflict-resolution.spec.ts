import { test, expect } from "@playwright/test";

test.describe("Flow 3: Conflict Resolution", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    // Wait for services to load
    await expect(page.getByRole("heading", { name: "Available Services" })).toBeVisible();
  });

  test("should prevent adding conflicting drug tests", async ({ page }) => {
    // Step 1: Add "Drug Test (5-Panel)" ($45)
    await page.getByRole("heading", { name: "Drug Test (5-Panel)", level: 4 }).click();

    // Verify it's added to the package
    await expect(page.getByText("(1 services)")).toBeVisible();

    // Step 2: Locate "Drug Test (10-Panel)" - should show conflict warning
    // After adding 5-Panel, 10-Panel should show a conflict indicator
    const drugTest10Section = page.locator("div").filter({ hasText: /Drug Test \(10-Panel\).*\$65\.00/ }).first();
    await expect(drugTest10Section.getByText(/conflict/i)).toBeVisible();
  });

  test("should allow 10-Panel after removing 5-Panel", async ({ page }) => {
    // Step 1: Add "Drug Test (5-Panel)" ($45)
    await page.getByRole("heading", { name: "Drug Test (5-Panel)", level: 4 }).click();
    await expect(page.getByText("(1 services)")).toBeVisible();

    // Step 2: Remove it by clicking on the selected card again (toggle off)
    await page.getByRole("heading", { name: "Drug Test (5-Panel)", level: 4 }).click();

    // Verify it's removed
    await expect(page.getByText("No services selected")).toBeVisible();

    // Step 3: Now add "Drug Test (10-Panel)" ($65)
    await page.getByRole("heading", { name: "Drug Test (10-Panel)", level: 4 }).click();

    // Step 4: Verify it's added
    await expect(page.getByText("(1 services)")).toBeVisible();
    await expect(page.getByText("Subtotal (1 service)")).toBeVisible();
  });

  test("should show proper conflict message", async ({ page }) => {
    // Add Drug Test (10-Panel) first
    await page.getByRole("heading", { name: "Drug Test (10-Panel)", level: 4 }).click();
    await expect(page.getByText("(1 services)")).toBeVisible();

    // Now 5-Panel should show conflict
    const drugTest5Section = page.locator("div").filter({ hasText: /Drug Test \(5-Panel\).*\$45\.00/ }).first();
    await expect(drugTest5Section.getByText(/conflict/i)).toBeVisible();
  });
});
