import { test, expect } from './fixtures';

test('shows translated account validation', async ({ homePage }) => {
  await homePage.goto('/user/login');
  await homePage.getByPlaceholder('Email').fill('invalid');
  await homePage.getByPlaceholder('Password').fill('test');
  await homePage.getByRole('button', { name: 'Sign in' }).click();

  await expect(homePage.getByText('Please fill in')).toBeVisible();
});
