import { test, expect } from "@playwright/test";

test.describe("Flow 2: Dependency Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    // Wait for services to load
    await expect(page.getByRole("heading", { name: "Available Services" })).toBeVisible();
  });

  test("should show dependency warning for County Criminal Search", async ({ page }) => {
    // Verify County Criminal Search shows dependency warning
    await expect(page.getByText(/Requires.*State Criminal Search/i).first()).toBeVisible();
  });

  test("should enable County Criminal after adding State Criminal", async ({ page }) => {
    // Step 1: Verify County Criminal shows dependency warning initially
    await expect(page.getByText(/Requires.*State Criminal Search/i).first()).toBeVisible();

    // Step 2: Add "State Criminal Search" first
    await page.getByRole("heading", { name: "State Criminal Search", level: 4 }).click();

    // Step 3: Verify State Criminal is in package
    await expect(page.getByText("Subtotal (1 service)")).toBeVisible();

    // Step 4: Add County Criminal - it should now be enabled
    await page.getByRole("heading", { name: "County Criminal Search", level: 4 }).click();

    // Step 5: Verify both in package
    await expect(page.getByText("Subtotal (2 services)")).toBeVisible();
  });

  test("should also require State Criminal for Federal Criminal", async ({ page }) => {
    // Add State Criminal first
    await page.getByRole("heading", { name: "State Criminal Search", level: 4 }).click();
    await expect(page.getByText("Subtotal (1 service)")).toBeVisible();

    // Add Federal Criminal
    await page.getByRole("heading", { name: "Federal Criminal Search", level: 4 }).click();

    // Verify both in package
    await expect(page.getByText("Subtotal (2 services)")).toBeVisible();
  });
});
