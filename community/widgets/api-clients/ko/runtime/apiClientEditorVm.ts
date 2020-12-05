import * as ko from "knockout";
import { ServerOnlyClientContract } from "../../services/serverOnlyClientContract";
import { ApiClientsService } from "../../services/apiClientsService";
import { ApiClientEditContract } from "../../services/apiClientEditContract";
import { ApiClientEnvironment } from "../../services/apiClientEnvironment";
import { ApiScopeContract } from "../../services/apiScopeContract";
import { AuthClaimValueContract } from "../../services/authClaimValueContract";
import { customAlphabet } from 'nanoid';

export class ApiClientEditorVm {
    public clientId: string;
    public clientSecret1: ko.Observable<string>;
    public clientSecret2: ko.Observable<string>;
    public clientName: ko.Observable<string>;
    public description: ko.Observable<string>;
    public allowedScopes: ko.ObservableArray<string>;
    public authClaimValues: ko.ObservableArray<string>;
    public enabled: ko.Observable<boolean>;

    private close: () => void;
    public isLoading: ko.Observable<boolean>;
    private apiClientContract: ServerOnlyClientContract;
    private getRandomSecretKey: () => string;

    public availableApiScopes: Array<string>;
    public availableAuthClaims: Array<string>;

    constructor(
        private apiClientsService: ApiClientsService,
        private apiClientEnvironment: ApiClientEnvironment,
        availableApiScopes: Array<ApiScopeContract>,
        availableAuthClaims: Array<AuthClaimValueContract>,
        apiClient: ServerOnlyClientContract,
        close: () => void
    ) {
        this.clientId = apiClient.clientId;
        this.clientSecret1 = ko.observable(apiClient.clientSecret1 ?? "***");
        this.clientSecret2 = ko.observable(apiClient.clientSecret2 ?? "***");
        this.clientName = ko.observable(apiClient.clientName);
        this.description = ko.observable(apiClient.description);
        this.allowedScopes = ko.observableArray(apiClient.allowedScopes);
        this.authClaimValues = ko.observableArray(apiClient.authClaimValues.map(c => c.type + ": " + c.value));
        this.enabled = ko.observable(apiClient.enabled);
        this.close = close;
        this.apiClientContract = apiClient;
        this.isLoading = ko.observable(false);

        this.availableApiScopes = availableApiScopes.map(s => s.name);
        this.availableAuthClaims = availableAuthClaims.map(c => c.type + ": " + c.value);

        this.getRandomSecretKey = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 50);
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
            clientSecret1: this.clientSecret1().length == 54 ? this.clientSecret1() : "",
            clientSecret2: this.clientSecret2().length == 54 ? this.clientSecret2() : "",
            clientName: this.clientName() || this.clientId,
            description: this.description(),
            allowedScopes: this.allowedScopes(),
            authClaimValues: this.authClaimValues()
                .map(c => { var s = c.split(": "); return { type: s[0], value: s[1] }}),
            enabled: this.enabled()
        }
        await this.apiClientsService.editApiClient(
            this.apiClientEnvironment, this.clientId, apiClient);
        this.isLoading(false);
        await this.close();
    }

    public async clickCancel() {
        await this.close();
    }

    public clickResetSecret1() {
        this.clientSecret1("cs1." + this.getRandomSecretKey());
    }
    public clickResetSecret2() {
        this.clientSecret2("cs2." + this.getRandomSecretKey());
    }
}