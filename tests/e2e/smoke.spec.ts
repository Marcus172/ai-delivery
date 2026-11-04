import { expect, test } from "@playwright/test";

test("english root has lang=en", async ({ page }) => {
  await page.goto("");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("czech root has lang=cs", async ({ page }) => {
  await page.goto("cs/");
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");
});

for (const [scheme, rgb] of [
  ["light", "rgb(246, 246, 243)"],
  ["dark", "rgb(19, 20, 22)"],
] as const) {
  test(`body background under ${scheme} scheme`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    await page.goto("");
    await expect(page.locator("body")).toHaveCSS("background-color", rgb);
    await context.close();
  });
}
