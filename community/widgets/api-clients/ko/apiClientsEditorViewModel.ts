import * as ko from "knockout";
import template from "./apiClientsEditorView.html";
import { WidgetEditor } from "@paperbits/common/widgets";
import { Component, OnMounted, Param, Event, OnDestroyed } from "@paperbits/common/ko/decorators";
import { ApiClientsModel } from "../apiClientsModel";
import { widgetEditorSelector } from "..";

@Component({
    selector: widgetEditorSelector,
    template: template
})
export class ApiClientsEditorViewModel implements WidgetEditor<ApiClientsModel> {
    
    
    @Param()
    public model: ApiClientsModel;

    @Event()
    public onChange: (model: ApiClientsModel) => void;

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
