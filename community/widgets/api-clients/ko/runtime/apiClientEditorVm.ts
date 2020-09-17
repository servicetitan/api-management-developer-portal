import * as ko from "knockout";
import { ApiClientContract } from "../../services/apiClientContract";
import { ApiClientsService } from "../../services/apiClientsService";
import { ApiClientEditContract } from "../../services/apiClientEditContract";
import { ApiClientEnvironment } from "../../services/apiClientEnvironment";


export class ApiClientEditorVm {
    public id: number;
    public clientId: ko.Observable<string>;
    public clientSecret1: ko.Observable<string>;
    public clientSecret2: ko.Observable<string>;
    public name: ko.Observable<string>;
    public grantTypes: ko.ObservableArray<string>;
    public scopes: ko.ObservableArray<string>;
    public enabled: ko.Observable<boolean>;

    private close: () => void;
    public isLoading: ko.Observable<boolean>;
    private apiClientContract: ApiClientContract;

    constructor(
        private apiClientsService: ApiClientsService,
        private apiClientEnvironment: ApiClientEnvironment,
        public allGrantTypes: Array<string>,
        public allScopes: Array<string>,
        apiClient: ApiClientContract,
        close: () => void
    ) {
        this.id = apiClient.id;
        this.clientId = ko.observable(apiClient.clientId);
        this.name = ko.observable(apiClient.name);
        this.clientSecret1 = ko.observable();
        this.clientSecret2 = ko.observable();
        this.grantTypes = ko.observableArray(apiClient.grantTypes);
        this.scopes = ko.observableArray(apiClient.scopes);
        this.enabled = ko.observable(apiClient.enabled);
        this.close = close;
        this.apiClientContract = apiClient;
        this.isLoading = ko.observable(false);
    }

    public canSave(): boolean {
        return true;
    }

    public async clickSave() {
        if (this.isLoading()) {
            return;
        }
        this.isLoading(true);
        const apiClient: ApiClientEditContract = {
            clientId: this.clientId(),
            clientSecret1: this.clientSecret1(),
            clientSecret2: this.clientSecret2(),
            name: this.name(),
            grantTypes: this.grantTypes(),
            scopes: this.scopes(),
            enabled: this.enabled()
        }
        await this.apiClientsService.editApiClient(
            this.apiClientEnvironment, this.id, apiClient);
        this.isLoading(false);
        this.close();
    }

    public clickCancel() {
        this.close();
    }
}