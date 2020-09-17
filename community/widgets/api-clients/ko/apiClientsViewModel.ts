import * as ko from "knockout";
import template from "./apiClientsView.html";
import { widgetSelector } from "../constants";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: widgetSelector,
    template: template
})
export class ApiClientsViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}
