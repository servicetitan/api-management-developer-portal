import template from "./modal.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "modal",
    template: template
})
export class Modal {
    public readonly title: string;
    public readonly close?: () => void;

    constructor({ title, close }: { title: string; close?: () => void; }) {
        this.title = title;
        this.close = close;
    }

    public clickClose(parent: unknown) {
        this.close.call(parent);
    }
}
