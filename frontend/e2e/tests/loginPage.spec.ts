import test, { expect } from "@playwright/test";
import type { User } from "../../src/types.ts";
import LoginPage from "../pages/LoginPage";

let loginPage: LoginPage;
let users: User[] = [];

// Clear storage state for login tests since we're testing the login flow
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async({page}) => {
    loginPage = new LoginPage(page);
});

test("users displayed", async() => {
    await test.step("navigate to login page", async() => {
        const usersRequest = loginPage.waitForResponseStatus("/users", { method: "GET", returnJson: true });
        await loginPage.goto();
        users = await usersRequest as User[];
    });

    await test.step("headers are present", async() => {
        await expect(loginPage.title).toHaveText("The Sloan Library");
        await expect(loginPage.subheading).toHaveText("Who's reading?");
    });

    for (const user of users) {
        await test.step(`${user.name} is displayed correctly`, async() => {
            await loginPage.assertUser(user);
        });
    }
});

test("selecting user navigates to home page", async() => {
    let testUser: User | undefined;

    await test.step("navigate to login page", async() => {
        const usersRequest = loginPage.waitForResponseStatus("/users", { method: "GET", returnJson: true });
        await loginPage.goto();
        users = await usersRequest as User[];
    });

    await test.step("click on 'test' user and validate navigation", async() => {
        testUser = users.find(user => user.name.toLowerCase() === 'test');
        expect(testUser, "Test user should exist").toBeDefined();

        // Wait for the /users/select endpoint to be called
        const selectUserRequest = loginPage.waitForResponseStatus("/users/select", { 
            method: "POST", 
            returnJson: true 
        });

        // Click on the test user
        await loginPage.userAvatar(testUser!.id).click();

        // Validate the endpoint was called
        const selectResponse = await selectUserRequest;
        console.log(selectResponse);
        expect(selectResponse).toBeDefined();

        // Validate navigation to home page
        await expect(loginPage.page).toHaveURL('http://localhost:5173/');
    });

    await test.step("validate user is stored in localStorage", async() => {
        const storedUser = await loginPage.page.evaluate(() => {
            const stored = localStorage.getItem('currentUser');
            return stored ? JSON.parse(stored) : null;
        });

        console.log(storedUser);

        expect(storedUser, "User should be stored in localStorage").toBeDefined();
        expect(storedUser?.id).toBe(testUser!.id);
        expect(storedUser?.name).toBe(testUser!.name);
    });
});