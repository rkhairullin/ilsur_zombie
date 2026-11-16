import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 844, height: 390 }, { width: 667, height: 375 }, { width: 568, height: 320 }, { width: 1280, height: 720 }]) {
  test(`navigation and layout ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const play = page.getByRole('button', { name: 'НАЧАТЬ ШОУ' });
    const box = await play.boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await play.click();
    await expect(page.getByRole('heading', { name: 'Шоу вот-вот начнётся.' })).toBeVisible();
    await page.getByRole('button', { name: 'Пауза', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Припудрить носик' })).toBeVisible();
    await page.getByRole('button', { name: 'ВЕРНУТЬСЯ В ШОУ' }).click();
    await expect(page.locator('#pause-screen')).toBeHidden();
    await page.getByRole('button', { name: 'Пауза', exact: true }).click();
    await page.getByRole('button', { name: 'В ГЛАВНОЕ МЕНЮ' }).click();
    await expect(play).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('rotation blocks menu and pauses an active arena', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Поверни телефон' })).toBeVisible();
  await expect(page.locator('#menu')).toHaveJSProperty('inert', true);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'НАЧАТЬ ШОУ' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#arena')).toHaveJSProperty('inert', true);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: 'ВЕРНУТЬСЯ В ШОУ' })).toBeVisible();
});
