import { AngularSelector, waitForAngular } from 'testcafe-angular-selectors';

fixture`OpenDesk`
    .page('http://localhost:8000/opendesk/login/')
    .beforeEach(async t => {
        await waitForAngular();
    });

test('OpenDesk Login', async t => {
    const loginForm = AngularSelector('login-form');

    await t
        .typeText(loginForm.find('#input_1'), 'admin')
        .typeText(loginForm.find('#input_2'), 'admin')
        .click(loginForm.find('.md-button'));
});