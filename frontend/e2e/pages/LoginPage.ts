import { expect, Locator, Page } from "@playwright/test";
import type { User } from "../../src/types.ts";
import { hexToRgb } from "../../src/utils/colorUtils";
import BasePage from "./BasePage";

export default class LoginPage extends BasePage {
    readonly title: Locator;
    readonly subheading: Locator;

    constructor(page: Page) {
        super(page, '/login');
        this.title = page.getByRole('heading', { name: 'The Sloan Library' });
        this.subheading = page.getByRole('heading', { name: 'Who\'s reading?' })
    }

    /**
     * Asserts the user's name and avatar are displayed correctly.
     * @param user 
     */
    async assertUser(user: User) {
        await expect(this.userName(user.id)).toHaveText(user.name);

        // Avatar may be a solid color with character OR an image.
        const userAvatar = this.userAvatar(user.id);
        if (user.avatar_image) {
            await expect(userAvatar).toHaveAttribute("src", user.avatar_image);
        } else {
            await expect(userAvatar).toHaveText(user.name.charAt(0));
            await expect(userAvatar).toHaveCSS("background-color", hexToRgb(user.color));
        }
    }

    userName(userId: number): Locator {
        return this.page.getByTestId(`user-name-${userId}`);
    }

    userAvatar(userId: number): Locator {
        return this.page.getByTestId(`user-avatar-${userId}`);
    }
}