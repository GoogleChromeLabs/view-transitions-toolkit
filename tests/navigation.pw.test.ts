import { test, expect } from "@playwright/test";

test.describe("Navigation Types", () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Requires Chrome 126+');

  test("should apply types and style boxes during transition", async ({ page }) => {
    // Log window.navigation status
    page.on('domcontentloaded', async () => {
        const status = await page.evaluate(() => {
            const win = window as any;
            return {
                hasNav: !!win.navigation,
                hasActivation: !!win.navigation?.activation,
                hasFrom: !!win.navigation?.activation?.from,
                fromUrl: win.navigation?.activation?.from?.url,
                currentUrl: window.win?.location.href || window.location.href, // Fallback just in case
            };
        });
        // console.log("PAGE LOG: Nav Status:", status);
    });

    // Add style tag before navigation?
    // Wait, addInitScript runs on every page.
    // So it will apply to the home page too!
    // And Home page might start a transition or not.
    // But it will apply to the new page!

    // Add init script to slow down VT animations
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-group(*) {
                animation-duration: 10s !important;
            }
        `;
        document.head.appendChild(style);
    });

    // Log network requests
    // ... (removed for brevity)

    // Add init script to slow down VT animations
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-group(*) {
                animation-duration: 10s !important;
            }
        `;
        document.head.appendChild(style);
    });

    // Go to the demo home page
    await page.goto("http://localhost:7357/demo/navigation-types/");

    // Verify initial state (no transition types active, boxes should be white)
    const fromBox = page.locator('.from');
    const toBox = page.locator('.to');

    await expect(fromBox).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(toBox).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Add init script to capture transition styles
    await page.addInitScript(() => {
        window.addEventListener('pagereveal', (e: any) => {
            if (e.viewTransition) {
                // Wait for next frame (or task) to let useAutoTypes run and styles apply
                setTimeout(() => {
                    const fromBox = document.querySelector('.from');
                    const toBox = document.querySelector('.to');
                    
                    (window as any).testResult = {
                        fromColor: fromBox ? getComputedStyle(fromBox).backgroundColor : 'null',
                        toColor: toBox ? getComputedStyle(toBox).backgroundColor : 'null',
                        types: Array.from(e.viewTransition.types || []),
                    };
                }, 100); // 100ms should be safe
            }
        });
    });

    // Go to the demo home page
    await page.goto("http://localhost:7357/demo/navigation-types/");

    // Verify initial state (no transition types active, boxes should be white)
    // fromBox and toBox are already declared earlier

    await expect(fromBox).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(toBox).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Click 'Detail 1' via Playwright
    // Wait, use relative link from the current page
    await page.locator('a[href="./detail/1"]').click();

    // Wait for the test result to be available
    await page.waitForFunction(() => (window as any).testResult !== undefined, { timeout: 10000 });

    // Get the result
    const result = await page.evaluate(() => (window as any).testResult);

    // console.log("PAGE LOG: Transition Result:", result);

    // Check colors
    // Home -> Detail 1
    // from: index -> from-index should be active
    // to: detail -> to-detail should be active
    expect(result.fromColor).toBe('rgb(240, 240, 240)');
    expect(result.toColor).toBe('rgb(224, 240, 255)');

    // We can also check types directly
    expect(result.types).toContain('from-index');
    expect(result.types).toContain('to-detail');

    // Check colors on the new page (Detail 1)
    // Home -> Detail 1
    // from: index -> from-index should be active
    // to: detail -> to-detail should be active
    // Wait, does useAutoTypes add types with suffix?
    // "from-${fromName}" -> "from-index"
    // "to-${toName}" -> "to-detail"
    // Yes!

    // So on Detail 1 page:
    // .from should find the .from box ON Detail 1.
    // And it should be styled by `html :active-view-transition-type(from-index) .from`.
    // Wait! Is the type `from-index` active on Detail 1?
    // Let's check src/navigation.ts again.
    // In `pagereveal`:
    // e.viewTransition.types.add(`from-${fromName}`);
    // e.viewTransition.types.add(`to-${toName}`);
    // Yes! It adds BOTH!
    // So `.from` should be rgb(240, 240, 240) (#f0f0f0).
    // And `.to` should be rgb(224, 240, 255) (#e0f0ff).

    // Wait, the user's CSS targets `.from` and `.to` within specific types.
    // :active-view-transition-type(from-index) .from { background-color: #f0f0f0; }
    // :active-view-transition-type(to-detail) .to { background-color: #e0f0ff; }
    // Detail 1 HAS a `.from` and `.to` box!
    // So BOTH styles should apply!
    // This is a great test!

    await expect(fromBox).toHaveCSS('background-color', 'rgb(240, 240, 240)');
    await expect(toBox).toHaveCSS('background-color', 'rgb(224, 240, 255)');

    // Now navigate back to Home?
    // Detail 1 -> Home
    // from: detail -> from-detail should be active
    // to: index -> to-index should be active
    // Reset testResult for next transition
    await page.evaluate(() => (window as any).testResult = undefined);

    // Click 'Home' via relative link
    await page.locator('a[href="../"]').click();

    // Wait for the test result to be available
    await page.waitForFunction(() => (window as any).testResult !== undefined, { timeout: 10000 });

    // Get the result
    const nextResult = await page.evaluate(() => (window as any).testResult);

    // console.log("PAGE LOG: Transition Result 2:", nextResult);

    // Check colors
    // Detail 1 -> Home
    // from: detail -> from-detail should be active
    // to: index -> to-index should be active
    expect(nextResult.fromColor).toBe('rgb(224, 240, 255)');
    expect(nextResult.toColor).toBe('rgb(240, 240, 240)');

    // We can also check types directly
    expect(nextResult.types).toContain('from-detail');
    expect(nextResult.types).toContain('to-index');

    // On Home page, boxes should be white again
    await expect(fromBox).toHaveCSS('background-color', 'rgb(255, 255, 255)', { timeout: 10000 });
    await expect(toBox).toHaveCSS('background-color', 'rgb(255, 255, 255)', { timeout: 10000 });

  });
});
