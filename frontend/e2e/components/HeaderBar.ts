import { Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";
import ProfileDropdown from "./ProfileDropdown";
import ProfileEditor from "./ProfileEditor";

export default class HeaderBar extends BaseComponent {
    readonly listsButton;
    readonly addBookButton;
    readonly profileDropdown: ProfileDropdown;
    readonly profileEditor: ProfileEditor;

    constructor(page: Page) {
        super(page);

        this.listsButton = page.getByRole('button').filter({ hasText: 'Lists' });
        this.addBookButton = page.getByRole('button').filter({ hasText: 'Add Book' });
        this.profileDropdown = new ProfileDropdown(page);
        this.profileEditor = new ProfileEditor(page);
    }
}