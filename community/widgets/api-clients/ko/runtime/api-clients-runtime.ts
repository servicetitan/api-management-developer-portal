import * as ko from "knockout";
import template from "./api-clients-runtime.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import { ApiClientsService } from "../../services/apiClientsService";
import { ApiClientsPageContract } from "../../services/apiClientsPageContract";
import { ApiClientEnvironment } from "../../services/apiClientEnvironment";
import { ApiClientEditorVm } from "./apiClientEditorVm"
import { ApiClientContract } from "../../services/apiClientContract";
import { ApiClientsEnvironmentContract } from "../../services/apiClientsEnvironmentContract";
import { customAlphabet } from 'nanoid';


@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class ApiClientsRuntime {
    public readonly isProductionView: ko.Observable<boolean>;
    public readonly isProductionAvailable: ko.Observable<boolean>;
    public readonly isLoading: ko.Observable<boolean>;
    public readonly isEditing: ko.Observable<boolean>;
    public readonly searchPattern: ko.Observable<string>;
    public readonly apiClientEditor: ko.Observable<ApiClientEditorVm>;
    public readonly currentEnvironment: ko.PureComputed<ApiClientsEnvironmentContract>;

    private pageContract: ApiClientsPageContract;
    private getRandomString25: () => string;

    constructor(
        private readonly apiClientsService: ApiClientsService,
    ) {
        this.isProductionView = ko.observable(false);
        this.isProductionAvailable = ko.observable();
        this.isLoading = ko.observable(false);
        this.isEditing = ko.observable(false);
        this.searchPattern = ko.observable("");
        this.apiClientEditor = ko.observable();
        this.currentEnvironment = ko.pureComputed(() => {
            // first code block, we need to compute based on isProductionView observable
            const isProductionAvailable = this.isProductionAvailable();
            if (this.pageContract == null) {
                return null;
            }
            return isProductionAvailable && this.isProductionView()
                ? this.pageContract.productionEnvironment
                : this.pageContract.sandboxEnvironment;
        });
        this.getRandomString25 = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 25);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.isLoading(true);
        const page = await this.apiClientsService.getApiClients();
        this.pageContract = page;
        this.isProductionAvailable(page.isProductionAvailable);
        this.isLoading(false);
    }

    public clickCreateApiClient() {
        const emptyClient: ApiClientContract = {
            clientId: "cid." + this.getRandomString25(),
            clientSecret1: "cs1." + this.getRandomString25() + this.getRandomString25(),
            clientSecret2: "cs2." + this.getRandomString25() + this.getRandomString25(),
            clientName: "",
            description: "",
            allowedScopes: this.currentEnvironment().availableApiScopes.map(s => s.name),
            authClaimValues: this.currentEnvironment().availableAuthClaims,
            enabled: true
        }

        this.clickEditApiClient(emptyClient);
    }

    public clickEditApiClient(apiClient: ApiClientContract) {
        const environment = this.isProductionView()
            ? ApiClientEnvironment.Production : ApiClientEnvironment.Sandbox;

        const editor = new ApiClientEditorVm(
            this.apiClientsService,
            environment,
            this.currentEnvironment().availableApiScopes,
            this.currentEnvironment().availableAuthClaims,
            apiClient,
            async () => { this.isEditing(false); await this.initialize(); }
        );

        this.apiClientEditor(editor);
        this.isEditing(true);
    }

    @OnDestroyed()
    public async dispose(): Promise<void> {
        console.log("ApiClientsRuntime.dispose (@OnDestroyed())");
        // Your cleanup widget logic
    }

    public
}