import { expect, test } from '@playwright/test';

test('existing screens register, restore sessions, sign out, sign in, and request recovery', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const email = `ui-${Date.now()}@example.com`;
  const password = 'SynapseTesting2026!';
  await page.goto('/sign-up');
  await page.getByRole('textbox', { name: 'First name', exact: true }).fill('Toni');
  await page.getByRole('textbox', { name: 'Last name', exact: true }).fill('Coleman');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'Remember me' }).check();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByRole('button', { name: 'Send reset link', exact: true }).click();
  await expect(page.getByText(/If an account uses this email/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('unchecking Remember me keeps the session in memory only', async ({ page }) => {
  const email = `temporary-${Date.now()}@example.com`;
  const password = 'SynapseTesting2026!';
  const response = await page.request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
    data: { email, password, returnSecureToken: true },
  });
  expect(response.ok()).toBeTruthy();
  await page.goto('/sign-in');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('checkbox', { name: 'Remember me' }).uncheck();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});
