import * as ko from "knockout";
import template from "./api-apps-runtime.html";
import apiAppListTemplate from "./api-app-list.html";
import apiAppEditorTemplate from "./api-app-editor.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppsPageContract } from "../../services/apiAppsPageContract";
import { ApiAppEditorVm } from "./apiAppEditorVm"
import { ApiAppContract } from "../../services/apiAppContract";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template,
    childTemplates: {
        apiAppList: apiAppListTemplate,
        apiAppEditor: apiAppEditorTemplate
    }
})
export class ApiAppsRuntime {
    public readonly isLoading: ko.Observable<boolean>;
    public readonly isEditing: ko.Observable<boolean>;
    public readonly searchPattern: ko.Observable<string>;
    public readonly apiAppEditor: ko.Observable<ApiAppEditorVm>;

    private pageContract: ko.Observable<ApiAppsPageContract>;

    constructor(
        private readonly apiAppsService: ApiAppsService,
    ) {
        this.isLoading = ko.observable(false);
        this.isEditing = ko.observable(false);
        this.searchPattern = ko.observable("");
        this.apiAppEditor = ko.observable();
        this.pageContract = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.isLoading(true);
        this.pageContract(await this.apiAppsService.getApiAppsPage());
        this.isLoading(false);
    }

    public clickCreateApiApp() {
        const emptyApiApp: ApiAppContract = {
            id: 0,
            publicId: "",
            name: "",
            organizationName: "",
            homepageUrl: "",
            authScopes: [],
            applicationKey1: "",
            deleted: false,
            appAvailabilityList: this.pageContract().defaultAvailabilityList
        }

        this.clickEditApiApp(emptyApiApp);
    }

    public clickEditApiApp(apiClient: ApiAppContract) {
        const editor = new ApiAppEditorVm(
            this.apiAppsService,
            apiClient,
            this.pageContract().projectId,
            this.pageContract().scopeGroups,
            async () => { this.isEditing(false); await this.initialize(); }
        );

        this.apiAppEditor(editor);
        this.isEditing(true);
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        console.log("ApiAppsRuntime.dispose (@OnDestroyed())");
        // Your cleanup widget logic
    }
}