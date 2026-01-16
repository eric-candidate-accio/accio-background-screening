import { test, expect } from "@playwright/test";

test.describe("Flow 1: Building a Basic Package", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    // Wait for services to load
    await expect(page.getByRole("heading", { name: "Available Services" })).toBeVisible();
  });

  test("should display service categories", async ({ page }) => {
    // Verify all category tabs are visible
    await expect(page.getByRole("tab", { name: "All Services" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Criminal/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Verification" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Driving" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Drug Screening" })).toBeVisible();
  });

  test("should build and save a basic package", async ({ page }) => {
    // Step 1: Add "State Criminal Search" ($15) - click on the heading to toggle
    await page.getByRole("heading", { name: "State Criminal Search", level: 4 }).click();

    // Verify package header shows count
    await expect(page.getByText("Your Package").first()).toBeVisible();

    // Step 2: Add "Employment Verification" ($35)
    await page.getByRole("heading", { name: "Employment Verification", level: 4 }).click();

    // Step 3: Add "Drug Test (5-Panel)" ($45)
    await page.getByRole("heading", { name: "Drug Test (5-Panel)", level: 4 }).click();

    // Step 4: Verify subtotal shows $95.00 (15 + 35 + 45 = 95)
    await expect(page.getByText("Subtotal (3 services)")).toBeVisible();
    await expect(page.getByText("$95.00").first()).toBeVisible();

    // Step 5: Enter package name "Standard Hire Package"
    const packageNameInput = page.getByPlaceholder(/package name/i);
    await packageNameInput.fill("Standard Hire Package");

    // Step 6: Click "Save Package"
    const saveButton = page.getByRole("button", { name: /Save Package/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Step 7: Navigate to saved packages
    await page.getByRole("button", { name: /View Saved Packages/i }).click();

    // Step 8: Verify package persists with correct name and total
    await expect(page.getByText("Standard Hire Package").first()).toBeVisible();
    await expect(page.getByText("$95.00").first()).toBeVisible();
  });
});
