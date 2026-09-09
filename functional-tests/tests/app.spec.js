const { test, expect } = require('@playwright/test');

function createCredentials(testInfo) {
  const suffix = `${Date.now()}_${testInfo.workerIndex}_${testInfo.retry}_${Math.random().toString(16).slice(2, 8)}`;
  return {
    username: `e2e_${suffix}`,
    password: `Pass_${suffix}`
  };
}

async function openApp(page) {
  await page.goto('/');
  await expect(page.getByTestId('username-input')).toBeVisible();
  await expect(page.getByTestId('password-input')).toBeVisible();
}

async function switchToRegister(page) {
  await page.getByTestId('switch-to-register').click();
  await expect(page.getByTestId('register-button')).toBeVisible();
}

async function registerUser(page, credentials) {
  await openApp(page);
  await switchToRegister(page);
  await page.getByTestId('username-input').fill(credentials.username);
  await page.getByTestId('password-input').fill(credentials.password);
  await page.getByTestId('register-button').click();
  await expect(page.getByTestId('logout-button')).toBeVisible();
}

async function logout(page) {
  await page.getByTestId('logout-button').click();
  await expect(page.getByTestId('login-button')).toBeVisible();
}

async function loginUser(page, credentials) {
  await page.getByTestId('username-input').fill(credentials.username);
  await page.getByTestId('password-input').fill(credentials.password);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('logout-button')).toBeVisible();
}

async function submitPoint(page, x, y, r) {
  await page.getByTestId(`x-button-${x}`).click();
  await page.getByTestId('y-input').fill(String(y));
  await page.getByTestId(`r-button-${r}`).click();
  await expect(page.getByTestId('check-button')).toBeEnabled();
  await page.getByTestId('check-button').click();
}

test('01 Открытие страницы входа', async ({ page }) => {
  await openApp(page);
  await expect(page.getByTestId('login-button')).toBeVisible();
  await expect(page.getByTestId('switch-to-register')).toBeVisible();
});

test('02 Переключение между входом и регистрацией', async ({ page }) => {
  await openApp(page);
  await switchToRegister(page);
  await page.getByTestId('switch-to-login').click();
  await expect(page.getByTestId('login-button')).toBeVisible();
});

test('03 Ошибка при пустой регистрации', async ({ page }) => {
  await openApp(page);
  await switchToRegister(page);
  await page.getByTestId('register-button').click();
  await expect(page.getByTestId('auth-error')).toBeVisible();
});

test('04 Регистрация нового пользователя', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await expect(page.getByTestId('area-canvas')).toBeVisible();
});

test('05 Выход после регистрации', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await logout(page);
});

test('06 Вход зарегистрированного пользователя', async ({ page }, testInfo) => {
  const credentials = createCredentials(testInfo);
  await registerUser(page, credentials);
  await logout(page);
  await loginUser(page, credentials);
});

test('07 Ошибка входа с неверным паролем', async ({ page }, testInfo) => {
  const credentials = createCredentials(testInfo);
  await registerUser(page, credentials);
  await logout(page);
  await page.getByTestId('username-input').fill(credentials.username);
  await page.getByTestId('password-input').fill(`${credentials.password}_wrong`);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('auth-error')).toBeVisible();
});

test('08 Отсутствие результатов у нового пользователя', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await expect(page.getByTestId('results-table-empty')).toBeVisible();
});

test('09 Кнопка проверки недоступна до ввода корректной точки', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await expect(page.getByTestId('check-button')).toBeDisabled();
});

test('10 Кнопка проверки доступна после ввода корректной точки', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await page.getByTestId('x-button-1').click();
  await page.getByTestId('y-input').fill('1');
  await page.getByTestId('r-button-2').click();
  await expect(page.getByTestId('check-button')).toBeEnabled();
});

test('11 Добавление попадания в таблицу результатов', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await submitPoint(page, 1, 1, 2);
  const table = page.getByTestId('results-table');
  await expect(table).toBeVisible();
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.locator('tbody tr').first()).toContainText('ПОПАДАНИЕ');
});

test('12 Добавление промаха в таблицу результатов', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await submitPoint(page, 5, 3, 1);
  const table = page.getByTestId('results-table');
  await expect(table).toBeVisible();
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.locator('tbody tr').first()).toContainText('ПРОМАХ');
});

test('13 Ошибка при недопустимом Y и блокировка кнопки проверки', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  await page.getByTestId('x-button-1').click();
  await page.getByTestId('y-input').fill('4');
  await page.getByTestId('r-button-2').click();
  await expect(page.getByTestId('y-error')).toBeVisible();
  await expect(page.getByTestId('check-button')).toBeDisabled();
});

test('14 Добавление результата по клику на график', async ({ page }, testInfo) => {
  await registerUser(page, createCredentials(testInfo));
  const canvas = page.getByTestId('area-canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  await canvas.click({
    position: {
      x: Math.floor(box.width / 2),
      y: Math.floor(box.height / 2)
    }
  });
  await expect(page.getByTestId('results-table').locator('tbody tr')).toHaveCount(1);
});

test('15 Сохранение результатов после выхода и повторного входа', async ({ page }, testInfo) => {
  const credentials = createCredentials(testInfo);
  await registerUser(page, credentials);
  await submitPoint(page, 1, 1, 2);
  await expect(page.getByTestId('results-table').locator('tbody tr')).toHaveCount(1);
  await logout(page);
  await loginUser(page, credentials);
  await expect(page.getByTestId('results-table').locator('tbody tr')).toHaveCount(1);
});
