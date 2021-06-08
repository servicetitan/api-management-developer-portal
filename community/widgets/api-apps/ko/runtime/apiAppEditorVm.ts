import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppScopeGroupContract } from "../../services/apiAppScopeGroupContract";
import { ApiAppAvailabilityCreateOrUpdateContract } from "../../services/apiAppAvailabilityCreateOrUpdateContract";
import { ApiAppCreateOrUpdateContract } from "../../services/apiAppCreateOrUpdateContract";

export class ApiAppEditorVm {
    public id: number;
    public publicId: string;
    public name: ko.Observable<string>;
    public organizationName: ko.Observable<string>;
    public homepageUrl: ko.Observable<string>;
    public authScopes: ko.ObservableArray<string>;
    public deleted: ko.Observable<boolean>;
    public appAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>

    public isLoading: ko.Observable<boolean>;
    public allScopeGroups: Array<ApiAppScopeGroupContract>;
    private close: () => Promise<void>;

    constructor(
        private apiAppsService: ApiAppsService,
        apiApp: ApiAppContract,
        private projectId: string,
        allScopeGroups: Array<ApiAppScopeGroupContract>,
        close: () => Promise<void>
    ) {
        this.id = apiApp.id;
        this.publicId = apiApp.publicId;
        this.name = ko.observable(apiApp.name);
        this.organizationName = ko.observable(apiApp.organizationName);
        this.homepageUrl = ko.observable(apiApp.homepageUrl);
        this.authScopes = ko.observableArray(
            apiApp.authScopes.filter(s => s.read).map(s => s.name + ":r").concat(
                apiApp.authScopes.filter(s => s.write).map(s => s.name + ":w")
            )
        );
        this.deleted = ko.observable(apiApp.deleted);
        this.appAvailabilityList = ko.observableArray(
            apiApp.appAvailabilityList.map(a => (
                { resourceOwner: a.resourceOwner, note: a.note }
            ))
        );
        this.isLoading = ko.observable(false);
        this.allScopeGroups = allScopeGroups;
        this.close = close;

        // this.availableApiScopes = availableApiScopes
        //     .filter(s => s.showInDiscoveryDoc || apiClient.allowedScopes.find(a => a == s.name) != null)
        //     .map(s => s.name);
        // this.apiScopeNames = availableApiScopes.reduce(
        //     (record, item) => {
        //         record[item.name] = item.displayName;
        //         return record;
        //     },
        //     {} as Record<string, string>
        // );
        // this.availableAuthClaims = availableAuthClaims.map(c => c.type + ": " + c.value);
    }

    public clickDeleteAppAvailability(item: ApiAppAvailabilityCreateOrUpdateContract) {
        this.appAvailabilityList.remove(item);
    }

    public clickAddAppAvailability() {
        this.appAvailabilityList.unshift({ resourceOwner: "", note: "" });
    }

    public canSave(): boolean {
        return true;
    }

    public async clickSave() {
        if (this.isLoading()) {
            return;
        }
        this.isLoading(true);
        const apiApp: ApiAppCreateOrUpdateContract = {
            id: this.id,
            name: this.name(),
            organizationName: this.organizationName(),
            homepageUrl: this.homepageUrl(),
            authScopes: this.authScopes(),
            deleted: this.deleted(),
            appAvailabilityList: this.appAvailabilityList()
        }

        await this.apiAppsService.createOrUpdateApiClient(this.projectId, apiApp);
        this.isLoading(false);
        await this.close();
    }

    public async clickCancel() {
        await this.close();
    }
}