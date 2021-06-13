import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppScopeGroupContract } from "../../services/apiAppScopeGroupContract";
import { ApiAppAvailabilityCreateOrUpdateContract } from "../../services/apiAppAvailabilityCreateOrUpdateContract";
import { ApiAppCreateOrUpdateContract } from "../../services/apiAppCreateOrUpdateContract";

export class ApiAppEditorVm {
    private maxTenants: number = 200;
    public id: number;
    public publicId: string;
    public applicationKey1: string;
    public readScopeNames: string;
    public writeScopeNames: string;
    public name: ko.Observable<string>;
    public organizationName: ko.Observable<string>;
    public homepageUrl: ko.Observable<string>;
    public authScopes: ko.ObservableArray<string>;
    public deleted: ko.Observable<boolean>;
    public appAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>

    public validationActivated: ko.Observable<boolean>;
    public nameValidation: ko.PureComputed<string>;
    public organizationNameValidation: ko.PureComputed<string>;
    public homepageUrlValidation: ko.PureComputed<string>;
    public authScopesValidation: ko.PureComputed<string>;
    public appAvailabilityValidation: ko.PureComputed<string>;
    public isValid: ko.PureComputed<boolean>;
    public saveButtonEnabled: ko.PureComputed<boolean>;
    public errorMessage: ko.Observable<string>;
    public isLoading: ko.Observable<boolean>;
    public allScopeGroups: Array<ApiAppScopeGroupContract>;
    public confirmDelete: ko.Observable<boolean>;
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
        this.applicationKey1 = apiApp.applicationKey1;
        this.name = ko.observable(apiApp.name);
        this.organizationName = ko.observable(apiApp.organizationName);
        this.homepageUrl = ko.observable(apiApp.homepageUrl);
        const readScopes = apiApp.authScopes.filter(s => s.read);
        const writeScopes = apiApp.authScopes.filter(s => s.write);
        this.authScopes = ko.observableArray(
            readScopes.map(s => s.name + ":r").concat(
                writeScopes.map(s => s.name + ":w"))
        );
        this.readScopeNames = readScopes.map(s => s.displayName).join(", ");
        this.writeScopeNames = writeScopes.map(s => s.displayName).join(", ");
        this.deleted = ko.observable(apiApp.deleted);
        this.appAvailabilityList = ko.observableArray(
            apiApp.appAvailabilityList.map(a => (
                { resourceOwner: a.resourceOwner, note: a.note }
            ))
        );
        this.isLoading = ko.observable(false);
        this.allScopeGroups = allScopeGroups;
        this.confirmDelete = ko.observable(false);
        this.close = close;
        this.errorMessage = ko.observable("");
        this.initValidation();
    }

    private initValidation() {
        this.validationActivated = ko.observable(this.id > 0);

        this.nameValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const name = this.name();
            if (name.length == 0) return "Application name is empty";
            if (name.length > 120) return "Application name is more than 120 chars";
            return "";
        });
        this.organizationNameValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const name = this.organizationName();
            if (name.length == 0) return "Organization name is empty";
            if (name.length > 120) return "Organization name is more than 120 chars";
            return "";
        });
        this.homepageUrlValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const url = this.homepageUrl();
            if (url.length == 0) return "Url is empty";
            try {
                new URL(url);
            } catch (e) {
                return "Url is not valid";
            }
            return "";
        });
        this.authScopesValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const scopes = this.authScopes();
            if (scopes.length == 0) return "API Scopes are not selected";
            return "";
        });
        this.appAvailabilityValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            var list = this.appAvailabilityList();
            if (list.length == 0) return "Tenant list is empty";
            if (list.length > this.maxTenants) return `Tenant list is more than ${this.maxTenants} items`;
            return "";
        });

        this.isValid = ko.pureComputed(() =>
            this.nameValidation().length == 0 &&
            this.organizationNameValidation().length == 0 &&
            this.homepageUrlValidation().length == 0 &&
            this.authScopesValidation().length == 0 &&
            this.appAvailabilityValidation().length == 0
        );
        this.saveButtonEnabled = ko.pureComputed(() =>
            !this.validationActivated() || this.isValid());
    }

    public clickDeleteAppAvailability(item: ApiAppAvailabilityCreateOrUpdateContract) {
        this.appAvailabilityList.remove(item);
    }

    public clickAddAppAvailability() {
        if (this.appAvailabilityList().length > this.maxTenants) {
            this.validationActivated(true);
            return;
        }
        this.appAvailabilityList.unshift({ resourceOwner: "", note: "" });
    }

    public async clickSave() {
        if (this.isLoading()) {
            return;
        }
        if (this.validationActivated() == false) {
            this.validationActivated(true);
        }
        if (!this.isValid()) {
            window.scroll({ top: 150, left: 0, behavior: 'smooth' });
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

        try {
            await this.apiAppsService.createOrUpdateApiClient(this.projectId, apiApp);
            this.isLoading(false);
            await this.close();
        }
        catch (e) {
            this.errorMessage(e.message);
            this.isLoading(false);
        }
    }

    public clickSelectScopeGroup(group: ApiAppScopeGroupContract) {
        const addScopes =
            group.scopes.filter(s => s.hasRead).map(s => s.name + ":r").concat(
                group.scopes.filter(s => s.hasWrite).map(s => s.name + ":w")
            );
        this.authScopes.remove(i => i.startsWith(group.name + "."));
        ko.utils.arrayPushAll(this.authScopes, addScopes);
    }

    public clickUnselectScopeGroup(group: ApiAppScopeGroupContract) {
        this.authScopes.remove(i => i.startsWith(group.name + "."));
    }

    public clickDelete() {
        this.confirmDelete(true);
    }

    public clickCancelDelete() {
        this.confirmDelete(false);
    }

    public async clickDeletePermanently() {
        this.deleted(true);
        await this.clickSave();
    }

    public async clickCancel() {
        await this.close();
    }
}