import * as ko from "knockout";
import template from "./apiAppsEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event, OnDestroyed } from "@paperbits/common/ko/decorators";
import { ApiAppsModel } from "../apiAppsModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class ApiAppsEditorViewModel implements WidgetEditor<ApiAppsModel> {
    
    
    @Param()
    public model: ApiAppsModel;

    @Event()
    public onChange: (model: ApiAppsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // Your initialization logic
    }

    private applyChanges(): void {
        this.onChange(this.model);
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}
