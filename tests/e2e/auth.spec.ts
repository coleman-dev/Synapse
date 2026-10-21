import { expect, test } from '@playwright/test';

test('welcome, account creation, sign in, recovery, About, and back navigation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page).toHaveURL(/sign-up/);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByText('Enter your first name.', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'First name', exact: true }).fill('Toni');
  await page.getByRole('textbox', { name: 'Last name', exact: true }).fill('Coleman');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill('toni@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Recovery2026!go!');
  await page.getByLabel('Confirm password', { exact: true }).fill('different');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByText('Passwords must match.')).toBeVisible();
  await page.getByLabel('Confirm password', { exact: true }).fill('Recovery2026!go!');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Authentication is not connected yet');
  await page.getByRole('link', { name: 'Already have an account? Sign in' }).click();
  await expect(page).toHaveURL(/sign-in/);
  await page.getByRole('checkbox', { name: 'Remember me' }).click();
  await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeChecked();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page).toHaveURL(/forgot-password/);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Email address' }).fill('toni@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('alert')).toContainText('Authentication is not connected yet');
  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page).toHaveURL(/sign-in/);
  await page.getByRole('link', { name: 'About Synapse', exact: true }).click();
  await expect(page.getByText('About Synapse.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page).toHaveURL(/sign-in/);
  await page.goto('/');
  await page.getByRole('link', { name: 'About us', exact: true }).click();
  await expect(page).toHaveURL(/about/);
  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:8081/');
  expect(errors).toEqual([]);
});

test('theme follows system initially and persists a manual change across screens and reloads', async ({
  page,
}) => {
  await page.goto('/');
  const toggle = page.getByRole('switch', { name: 'Dark mode' });
  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(toggle).toBeChecked();
  await page.getByRole('button', { name: 'Get started' }).click();
  await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeChecked();
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeChecked();
  await page.getByRole('switch', { name: 'Dark mode' }).click();
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Dark mode' })).not.toBeChecked();
});

for (const theme of ['light', 'dark'] as const) {
  for (const [name, route] of Object.entries({
    welcome: '/',
    'sign-up': '/sign-up',
    'sign-in': '/sign-in',
    recovery: '/forgot-password',
    about: '/about',
  })) {
    test(`${theme} ${name} matches the Figma screen proportions and uses local assets`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route);
      await expect(page.getByRole('switch', { name: 'Dark mode' })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
      );
      await expect(page.locator('body')).not.toContainText('Unmatched Route');
      const geometry = await page.getByRole('img', { name: 'Synapse logo' }).boundingBox();
      expect(geometry?.width).toBe(name === 'welcome' ? 290 : 44);
      expect(geometry?.height).toBe(name === 'welcome' ? 290 : 44);
      await page.screenshot({
        path: `docs/design/implementation/${theme}-${name}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        390,
      );
    });
  }
}

test('small phones and enlarged text keep forms reachable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/sign-up');
  await page.getByRole('button', { name: 'Create account', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.addStyleTag({
    content: '* { font-size: 150% !important; line-height: 1.5 !important; }',
  });
  await page
    .getByRole('link', { name: 'Already have an account? Sign in' })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('link', { name: 'Already have an account? Sign in' }),
  ).toBeInViewport();
});

test('direct recovery entry and unknown routes have a working way back', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page).toHaveURL(/sign-in/);
  await page.goto('/does-not-exist');
  await page.getByRole('button', { name: 'Back to welcome' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:8081/');
});
