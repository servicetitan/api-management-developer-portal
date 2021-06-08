import * as ko from "knockout";
import template from "./apiAppsView.html";
import { widgetSelector } from "../constants";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: widgetSelector,
    template: template
})
export class ApiAppsViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}
