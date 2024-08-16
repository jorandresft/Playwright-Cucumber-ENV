import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { pageFixture } from '../../hooks/PageFixture';

const userId = 'mngr584603';
const password = 'tadehuj';
const textExpected = 'Manger Id : mngr584603';

Given('Provide valid url', async function () {
    await pageFixture.page.goto(process.env.BASEURL);
});

Given('Provide valid username and password', async function () {
    await pageFixture.page.locator('[name=uid]').fill(userId);
    await pageFixture.page.locator('[name="password"]').fill(password);
});

Given('Provide valid username {string} and password {string}', async function (user: string, pass: string) {
    await pageFixture.page.locator('[name=uid]').fill(user);
    await pageFixture.page.locator('[name="password"]').fill(pass);
});

When('Click in login button', async function () {
    await pageFixture.page.click('[name="btnLogin"]');
});

Then('verify login is success', async function () {
    const textReceived = await pageFixture.page.locator('//td[text()="Manger Id : mngr584603"]').innerText();
    expect(textReceived).toEqual(textExpected);
});
