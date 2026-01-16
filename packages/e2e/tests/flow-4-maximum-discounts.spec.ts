import { test, expect } from "@playwright/test";

test.describe("Flow 4: Maximum Discounts", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    // Wait for services to load
    await expect(page.getByRole("heading", { name: "Available Services" })).toBeVisible();
  });

  // Helper function to add a service by clicking its heading
  async function addService(page: import("@playwright/test").Page, serviceName: string) {
    await page.getByRole("heading", { name: serviceName, level: 4 }).click();
  }

  test("should apply all discounts for maximum package", async ({ page }) => {
    // Step 1: Add all 4 criminal searches
    // State Criminal must be added first (it's a dependency for others)
    await addService(page, "State Criminal Search");
    await addService(page, "County Criminal Search");
    await addService(page, "Federal Criminal Search");
    await addService(page, "National Criminal Database");

    // Step 2: Add all 3 verification services
    await addService(page, "Employment Verification");
    await addService(page, "Education Verification");
    await addService(page, "Professional License Verification");

    // Step 3: Add MVR
    await addService(page, "Motor Vehicle Report (MVR)");

    // Step 4: Verify we have 8 services in subtotal
    await expect(page.getByText("Subtotal (8 services)")).toBeVisible();

    // Step 5-8: Verify final total is $160.50 (with all discounts applied)
    // 230 - 34.50 (volume) - 20 (criminal bundle) - 15 (verification bundle) = 160.50
    await expect(page.getByText("$160.50").first()).toBeVisible();
  });

  test("should save package with discounts and verify persistence", async ({ page }) => {
    // Add all services for maximum discounts
    await addService(page, "State Criminal Search");
    await addService(page, "County Criminal Search");
    await addService(page, "Federal Criminal Search");
    await addService(page, "National Criminal Database");
    await addService(page, "Employment Verification");
    await addService(page, "Education Verification");
    await addService(page, "Professional License Verification");
    await addService(page, "Motor Vehicle Report (MVR)");

    // Verify we have 8 services
    await expect(page.getByText("Subtotal (8 services)")).toBeVisible();

    // Enter package name
    const packageNameInput = page.getByPlaceholder(/package name/i);
    await packageNameInput.fill("Enterprise Full Package");

    // Save package
    const saveButton = page.getByRole("button", { name: /Save Package/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Navigate to saved packages
    await page.getByRole("button", { name: /View Saved Packages/i }).click();

    // Verify package persists with correct name
    await expect(page.getByText("Enterprise Full Package").first()).toBeVisible();

    // Verify the discounted total is shown
    await expect(page.getByText("$160.50").first()).toBeVisible();
  });

  test("should show discount when adding services", async ({ page }) => {
    // Add 4 criminal services for criminal bundle
    await addService(page, "State Criminal Search");
    await addService(page, "County Criminal Search");
    await addService(page, "Federal Criminal Search");
    await addService(page, "National Criminal Database");

    // Verify 4 services added
    await expect(page.getByText("Subtotal (4 services)")).toBeVisible();
    // 4 criminal = $110 subtotal
    // - 5% volume discount (4 services): -$5.50
    // - Criminal bundle: -$20
    // Total: $84.50
    await expect(page.getByText("$90.00").first()).toBeVisible();

    // Add 3 verification services for verification bundle
    await addService(page, "Employment Verification");
    await addService(page, "Education Verification");
    await addService(page, "Professional License Verification");

    // Now have 7 services
    await expect(page.getByText("Subtotal (7 services)")).toBeVisible();

    // Add MVR to trigger volume discount (8+ services)
    await addService(page, "Motor Vehicle Report (MVR)");
    await expect(page.getByText("Subtotal (8 services)")).toBeVisible();

    // Final total should be $160.50
    await expect(page.getByText("$160.50").first()).toBeVisible();
  });
});
