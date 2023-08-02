import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppClientContract } from "../../services/apiAppClientContract";
import { ApiAppClientSecretContract } from "../../services/apiAppClientSecretContract";
import { ApiAppsService } from "../../services/apiAppsService";
import { SecretManagementOption } from "../../services/secretManagementOption";
import "./modal";

enum ModalInstance {
    None,
    GenerateSecret,
    SecretValue,
    ManageSecrets,
    DeactivateSecret,
}

export class ApiAppClientListVm {
    public id: number;
    public publicId: string;
    public name: string;
    public currentScopesVersion: number;
    public secretManagementOption: SecretManagementOption;
    public clients: ko.ObservableArray<ApiAppClientContract>;
    public isLoading: ko.Observable<boolean>;

    public modalInstance = ModalInstance;
    public activeModal: ko.Observable<ModalInstance>;
    public selectedClient: ko.Observable<ApiAppClientContract | null>;
    public generatingSecret: ko.Observable<boolean>;
    public secretValue: ko.Observable<string>;
    public selectedSecret: ko.Observable<ApiAppClientSecretContract | null>;
    public deactivatingSecret: ko.Observable<boolean>;

    constructor(
        private apiAppsService: ApiAppsService,
        apiApp: ApiAppContract,
        private projectId: string,
        private close: () => Promise<void>
    ) {
        this.id = apiApp.id;
        this.publicId = apiApp.publicId;
        this.name = apiApp.name;
        this.currentScopesVersion = apiApp.scopesVersions[0].version;
        this.secretManagementOption = apiApp.secretManagementOption;
        this.clients = ko.observableArray();
        this.isLoading = ko.observable(true);
        this.activeModal = ko.observable(ModalInstance.None);
        this.selectedClient = ko.observable(null);
        this.generatingSecret = ko.observable(false);
        this.secretValue = ko.observable("");
        this.selectedSecret = ko.observable(null);
        this.deactivatingSecret = ko.observable(false);
        this.initialize();
    }

    private async initialize() {
        try {
            this.clients(await this.apiAppsService.getApiAppClients(this.projectId, this.id));
        }
        finally {
            this.isLoading(false);
        }
    }

    public async clickBack() {
        await this.close();
    }

    public clickCloseModal() {
        if ((this.activeModal() === ModalInstance.GenerateSecret && this.selectedClient().clientSecrets.length > 0) ||
            this.activeModal() === ModalInstance.DeactivateSecret
        ) {
            this.activeModal(ModalInstance.ManageSecrets);
        }
        else {
            this.activeModal(ModalInstance.None);
            this.selectedClient(null);
        }
    }

    public clickManageSecrets = (client: ApiAppClientContract) => {
        this.selectedClient(client);
        this.activeModal(ModalInstance.ManageSecrets);
    };

    public clickGenerateSecret = (client: ApiAppClientContract | null) => {
        if (client) {
            this.selectedClient(client);
        }
        this.activeModal(ModalInstance.GenerateSecret);
    };

    public async clickConfirmGenerateSecret() {
        this.generatingSecret(true);
        try {
            const selectedClient = this.selectedClient();
            this.secretValue(await this.apiAppsService.generateClientSecret(
                this.projectId, this.id, selectedClient.environmentId, selectedClient.clientId));
            const clientSecrets = await this.apiAppsService.getClientSecrets(
                this.projectId, this.id, selectedClient.environmentId, selectedClient.clientId);
            this.clients.replace(selectedClient, { ...selectedClient, clientSecrets });
            this.activeModal(ModalInstance.SecretValue);
        }
        finally {
            this.generatingSecret(false);
        }
    }

    public clickDeactivateSecret = async (secret: ApiAppClientSecretContract) => {
        this.selectedSecret(secret);
        this.activeModal(ModalInstance.DeactivateSecret);
    };

    public async clickConfirmDeactivateSecret() {
        this.deactivatingSecret(true);
        try {
            const selectedClient = this.selectedClient();
            const selectedSecret = this.selectedSecret();
            await this.apiAppsService.deactivateClientSecret(
                this.projectId, this.id, selectedClient.environmentId, selectedClient.clientId, selectedSecret.id);
            const clientSecrets = await this.apiAppsService.getClientSecrets(
                this.projectId, this.id, selectedClient.environmentId, selectedClient.clientId);
            const updatedClient = { ...selectedClient, clientSecrets };
            this.clients.replace(selectedClient, updatedClient);
            if (updatedClient.clientSecrets.length > 0) {
                this.selectedClient(updatedClient);
                this.activeModal(ModalInstance.ManageSecrets);
            }
            else {
                this.activeModal(ModalInstance.None);
                this.selectedClient(null);
            }
        }
        finally {
            this.deactivatingSecret(false);
        }
    }
}
