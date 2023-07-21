import * as ko from "knockout";
import template from "./api-apps-runtime.html";
import apiAppListTemplate from "./api-app-list.html";
import apiAppEditorTemplate from "./api-app-editor.html";
import apiAppClientListTemplate from "./api-app-client-list.html";
import apiAppErrorTemplate from "./api-app-error.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppsPageContract } from "../../services/apiAppsPageContract";
import { ApiAppEditorVm } from "./apiAppEditorVm"
import { ApiAppClientListVm } from "./apiAppClientListVm";
import { ApiAppContract } from "../../services/apiAppContract";
import { SecretManagementOption } from "../../services/secretManagementOption";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template,
    childTemplates: {
        apiAppList: apiAppListTemplate,
        apiAppEditor: apiAppEditorTemplate,
        apiAppClientList: apiAppClientListTemplate,
        apiAppError: apiAppErrorTemplate
    }
})
export class ApiAppsRuntime {
    public readonly isLoading: ko.Observable<boolean>;
    public readonly route: ko.Observable<"list" | "editor" | "clients">;
    public readonly searchPattern: ko.Observable<string>;
    public readonly apiAppEditor: ko.Observable<ApiAppEditorVm>;
    public readonly apiAppClientList: ko.Observable<ApiAppClientListVm>;
    public readonly errorMessage: ko.Observable<string>;

    private pageContract: ko.Observable<ApiAppsPageContract>;

    constructor(
        private readonly apiAppsService: ApiAppsService,
    ) {
        this.isLoading = ko.observable(false);
        this.route = ko.observable("list");
        this.searchPattern = ko.observable("");
        this.apiAppEditor = ko.observable();
        this.apiAppClientList = ko.observable();
        this.pageContract = ko.observable();
        this.errorMessage = ko.observable("");
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.isLoading(true);
        this.pageContract(null);
        try {
            const page = await this.apiAppsService.getApiAppsPage();
            this.pageContract(page);
        }
        catch (e) {
            this.errorMessage(e.message);
        }
        this.isLoading(false);
    }

    public clickCreateApiApp() {
        const emptyApiApp: ApiAppContract = {
            id: 0,
            publicId: "",
            name: "",
            organizationName: "",
            homepageUrl: "",
            scopesVersions: [],
            authScopes: [],
            applicationKey1: "",
            externalDataGuid: "",
            deleted: false,
            tenantAppAvailabilityList: this.pageContract().defaultTenantAppAvailabilityList,
            networkAppAvailabilityList: [],
            secretManagementOption: SecretManagementOption.Developer,
        }

        this.clickEditApiApp(emptyApiApp);
    }

    public clickEditApiApp(apiApp: ApiAppContract) {
        const editor = new ApiAppEditorVm(
            this.apiAppsService,
            apiApp,
            this.pageContract().projectId,
            this.pageContract().scopeGroups,
            async () => { this.route("list"); await this.initialize(); }
        );

        this.apiAppEditor(editor);
        this.route("editor");
    }

    public clickViewApiAppClients(apiApp: ApiAppContract) {
        const clientList = new ApiAppClientListVm(
            this.apiAppsService,
            apiApp,
            this.pageContract().projectId,
            async () => { this.route("list"); }
        );

        this.apiAppClientList(clientList);
        this.route("clients");
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        console.log("ApiAppsRuntime.dispose (@OnDestroyed())");
        // Your cleanup widget logic
    }
}