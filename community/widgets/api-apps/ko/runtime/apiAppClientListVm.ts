import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppClientContract } from "../../services/apiAppClientContract";
import { ApiAppsService } from "../../services/apiAppsService";

export class ApiAppClientListVm {
    public id: number;
    public publicId: string;
    public name: string;
    public currentScopesVersion: number;
    public clients: ko.Observable<ApiAppClientContract[]>;
    public isLoading: ko.Observable<boolean>;

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
        this.clients = ko.observable([]);
        this.isLoading = ko.observable(true);
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

    public async clickCancel() {
        await this.close();
    }
}
