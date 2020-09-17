import * as ko from "knockout";
import template from "./api-clients-runtime.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import { ApiClientsService } from "../../services/apiClientsService";
import { ApiClientsPageContract } from "../../services/apiClientsPageContract";
import { ApiClientEnvironment } from "../../services/apiClientEnvironment";
import { ApiClientEditorVm } from "./apiClientEditorVm"
import { ApiClientContract } from "../../services/apiClientContract";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class ApiClientsRuntime {
    public readonly isProductionView: ko.Observable<boolean>;
    public readonly isLoading: ko.Observable<boolean>;
    public readonly isEditing: ko.Observable<boolean>;
    public readonly searchPattern: ko.Observable<string>;
    public readonly apiClientEditor: ko.Observable<ApiClientEditorVm>;
    public readonly apiClients: ko.PureComputed<Array<ApiClientContract>>;

    private pageContract: ApiClientsPageContract;

    constructor(
        private readonly apiClientsService: ApiClientsService,
    ) {
        this.isProductionView = ko.observable(false);
        this.isLoading = ko.observable(false);
        this.isEditing = ko.observable(false);
        this.searchPattern = ko.observable("");
        this.apiClientEditor = ko.observable();
        this.apiClients = ko.pureComputed(() => {
            // first code block, we need to compute based on isProductionView observable
            const isProductionView = this.isProductionView();
            if (this.pageContract == null) {
                return [];
            }
            return isProductionView
                ? this.pageContract.productionApiClients
                : this.pageContract.sandboxApiClients;
        });

    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.isLoading(true);
        const page = await this.apiClientsService.getApiClients();
        this.pageContract = page;
        this.isLoading(false);
    }

    public clickCreateApiClient() {
        const emptyClient: ApiClientContract = {
            id: 0,
            clientId: "",
            name: "",
            grantTypes: [],
            scopes: [],
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
            this.pageContract.allGrantTypes,
            this.pageContract.allScopes,
            apiClient,
            () => { this.isEditing(false); this.initialize(); }
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