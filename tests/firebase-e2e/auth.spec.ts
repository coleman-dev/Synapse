import { expect, test } from '@playwright/test';

test('shared handler verifies email, recovers email, rejects mismatched modes and used codes', async ({ page }) => {
  const base = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
  const email = `actions-${Date.now()}@example.com`;
  const account = await (await page.request.post(`${base}/accounts:signUp?key=demo-key`, {
    data: { email, password: 'SynapseTesting2026!', returnSecureToken: true },
  })).json();
  await page.request.post(`${base}/accounts:sendOobCode?key=demo-key`, {
    data: { requestType: 'VERIFY_EMAIL', idToken: account.idToken },
  });
  async function getCode(requestType: string) {
    const { oobCodes } = await (await page.request.get('http://127.0.0.1:9099/emulator/v1/projects/demo-synapse/oobCodes')).json();
    return oobCodes.find((item: { email: string; requestType: string }) => item.email === email && item.requestType === requestType).oobCode;
  }
  const verifyCode = await getCode('VERIFY_EMAIL');
  await page.goto(`/email-action?mode=recoverEmail&oobCode=${encodeURIComponent(verifyCode)}`);
  await expect(page.getByRole('alert')).toContainText('invalid');
  await page.goto(`/email-action?mode=verifyEmail&oobCode=${encodeURIComponent(verifyCode)}&continueUrl=https://example.com`);
  await expect(page.getByRole('button', { name: 'Verify email', exact: true })).toBeVisible();
  // Merely opening a link must not consume it (for example in an email scanner).
  await page.reload();
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Email verified.' })).toBeVisible();
  let lookup = await (await page.request.post(`${base}/accounts:lookup?key=demo-key`, { data: { idToken: account.idToken } })).json();
  expect(lookup.users[0].emailVerified).toBe(true);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('already been used');
  const changed = await page.request.post(`${base}/accounts:update?key=demo-key`, {
    data: { idToken: account.idToken, email: `changed-${Date.now()}@example.com`, returnSecureToken: true },
  });
  expect(changed.ok()).toBeTruthy();
  const recoverCode = await getCode('RECOVER_EMAIL');
  const recoverUrl = `/email-action?mode=recoverEmail&oobCode=${encodeURIComponent(recoverCode)}`;
  await page.goto(recoverUrl);
  await page.getByRole('button', { name: 'Restore email', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Email restored.' })).toBeVisible();
  // Recovery revokes old sessions, so verify restoration with fresh credentials.
  const restored = await (await page.request.post(`${base}/accounts:signInWithPassword?key=demo-key`, {
    data: { email, password: 'SynapseTesting2026!', returnSecureToken: true },
  })).json();
  expect(restored.email).toBe(email);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('already been used');
  for (const url of ['/email-action', '/email-action?mode=unknown&oobCode=abc', '/email-action?mode=verifyEmail&oobCode=invalid']) {
    await page.goto(url);
    await expect(page.getByRole('link', { name: 'Back to sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify email', exact: true })).toHaveCount(0);
  }
});

test('reset link uses the branded screen, rejects reuse, and completes a one-time password reset', async ({ page }) => {
  const email = `reset-${Date.now()}@example.com`;
  const password = 'SynapseTesting2026!';
  const changed = 'FreshSynapsePassword2026!';
  await page.request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {
    data: { email, password, returnSecureToken: true },
  });
  await page.goto('/forgot-password');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText(/If an account uses this email/)).toBeVisible();
  const response = await page.request.get('http://127.0.0.1:9099/emulator/v1/projects/demo-synapse/oobCodes');
  const { oobCodes } = await response.json();
  const code = oobCodes.find((item: { email: string }) => item.email === email).oobCode;
  const url = `/email-action?mode=resetPassword&oobCode=${encodeURIComponent(code)}`;
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Reset password', exact: true })).toBeVisible();
  await expect(page.getByText('YOUR PASSWORD CHECKLIST')).toBeVisible();
  await page.getByLabel('New password', { exact: true }).fill('Short1!');
  await page.getByLabel('Confirm new password', { exact: true }).fill('mismatch');
  await page.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(page.getByText('Passwords must match.')).toBeVisible();
  await page.getByLabel('New password', { exact: true }).fill(password);
  await page.getByLabel('Confirm new password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('different from your current password');
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('switch', { name: 'Dark mode' }).click();
    await page.getByLabel('New password', { exact: true }).fill('');
    await page.getByLabel('Confirm new password', { exact: true }).fill('');
    await page.getByLabel('Confirm new password', { exact: true }).blur();
    await page.screenshot({ path: `docs/design/implementation/${theme}-reset-password.png`, fullPage: true });
  }
  await page.getByLabel('New password', { exact: true }).fill(changed);
  await page.getByLabel('Confirm new password', { exact: true }).fill(changed);
  await page.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A fresh start, secured.' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to sign in', exact: true }).click();
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect');
  await page.getByLabel('Password', { exact: true }).fill(changed);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Request a new link' })).toBeVisible();
});

test('missing and invalid reset links offer recovery and remain usable on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const url of ['/reset-password', '/reset-password?oobCode=invalid']) {
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Request a new link' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
  await page.getByRole('button', { name: 'Request a new link' }).click();
  await expect(page).toHaveURL(/forgot-password/);
});

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
