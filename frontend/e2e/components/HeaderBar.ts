import { Page } from "@playwright/test";
import BaseComponent from "./BaseComponent";
import ProfileDropdown from "./ProfileDropdown";
import ProfileEditor from "./ProfileEditor";

export default class HeaderBar extends BaseComponent {
    readonly profileDropdown: ProfileDropdown;
    readonly profileEditor: ProfileEditor;

    constructor(page: Page) {
        super(page);

        this.profileDropdown = new ProfileDropdown(page);
        this.profileEditor = new ProfileEditor(page);
    }
}