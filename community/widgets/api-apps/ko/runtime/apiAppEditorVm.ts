import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppScopeGroupContract } from "../../services/apiAppScopeGroupContract";
import { ApiAppAvailabilityCreateOrUpdateContract } from "../../services/apiAppAvailabilityCreateOrUpdateContract";
import { ApiAppCreateOrUpdateContract } from "../../services/apiAppCreateOrUpdateContract";

export class ApiAppEditorVm {
    private maxTenants: number = 2000;
    private maxNetworks: number = 15;
    public id: number;
    public publicId: string;
    public applicationKey1: string;
    public readScopeNames: string;
    public writeScopeNames: string;
    public name: ko.Observable<string>;
    public organizationName: ko.Observable<string>;
    public homepageUrl: ko.Observable<string>;
    public externalDataGuid: ko.Observable<string>;
    public authScopes: ko.ObservableArray<string>;
    public deleted: ko.Observable<boolean>;
    public tenantAppAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>;
    public networkAppAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>;
    public validationActivated: ko.Observable<boolean>;
    public nameValidation: ko.PureComputed<string>;
    public organizationNameValidation: ko.PureComputed<string>;
    public homepageUrlValidation: ko.PureComputed<string>;
    public externalDataGuidValidation: ko.PureComputed<string>;
    public authScopesValidation: ko.PureComputed<string>;
    public tenantAppAvailabilityValidation: ko.PureComputed<string>;
    public networkAppAvailabilityValidation: ko.PureComputed<string>;
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
        this.externalDataGuid = ko.observable(
            apiApp.id > 0 ? apiApp.externalDataGuid : this.generateGuid());
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
        this.tenantAppAvailabilityList = ko.observableArray(
            apiApp.tenantAppAvailabilityList.map(a => (
                { resourceOwner: a.resourceOwner, note: a.note }
            ))
        );
        this.networkAppAvailabilityList = ko.observableArray(
            apiApp.networkAppAvailabilityList.map(a => (
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

    private generateGuid()
    {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g,
            (c: any) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
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
        this.externalDataGuidValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const guid = this.externalDataGuid();
            return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guid)
                ? ""
                : "App GUID must be RFC 4122 version 4 universally unique identifier"
        });
        this.authScopesValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const scopes = this.authScopes();
            if (scopes.length == 0) return "API Scopes are not selected";
            return "";
        });
        this.tenantAppAvailabilityValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            var tenantList = this.tenantAppAvailabilityList();
            var networkList = this.networkAppAvailabilityList();
            if (tenantList.length == 0 && networkList.length == 0) return "Tenants list and networks list are empty";
            if (tenantList.length > this.maxTenants) return `Tenants list contains more than ${this.maxTenants} items`;
            return "";
        });
        this.networkAppAvailabilityValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            var list = this.networkAppAvailabilityList();
            if (list.length > this.maxNetworks) return `Networks list contains more than ${this.maxNetworks} items`;
            return "";
        });

        this.isValid = ko.pureComputed(() =>
            this.nameValidation().length == 0 &&
            this.organizationNameValidation().length == 0 &&
            this.homepageUrlValidation().length == 0 &&
            this.authScopesValidation().length == 0 &&
            this.tenantAppAvailabilityValidation().length == 0 &&
            this.networkAppAvailabilityValidation().length == 0 &&
            this.externalDataGuidValidation().length == 0
        );
        this.saveButtonEnabled = ko.pureComputed(() =>
            !this.validationActivated() || this.isValid());
    }

    public clickDeleteTenantAppAvailability(item: ApiAppAvailabilityCreateOrUpdateContract) {
        this.tenantAppAvailabilityList.remove(item);
    }

    public clickDeleteNetworkAppAvailability(item: ApiAppAvailabilityCreateOrUpdateContract) {
        this.networkAppAvailabilityList.remove(item);
    }

    public clickAddTenantAppAvailability() {
        if (this.tenantAppAvailabilityList().length >= this.maxTenants) {
            this.validationActivated(true);
        }
        if (this.tenantAppAvailabilityList().length <= this.maxTenants) {
            this.tenantAppAvailabilityList.unshift({ resourceOwner: "", note: "" });
        }
    }

    public clickAddNetworkAppAvailability() {
        if (this.networkAppAvailabilityList().length >= this.maxNetworks) {
            this.validationActivated(true);
        }
        if (this.networkAppAvailabilityList().length <= this.maxNetworks) {
            this.networkAppAvailabilityList.unshift({ resourceOwner: "", note: "" });
        }
    }

    public clickGenerateExternalDataGuid() {
        this.externalDataGuid(this.generateGuid());
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
            externalDataGuid: this.externalDataGuid(),
            deleted: this.deleted(),
            tenantAppAvailabilityList: this.tenantAppAvailabilityList(),
            networkAppAvailabilityList: this.networkAppAvailabilityList(),
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