import * as ko from "knockout";
import "../bindingHandlers/appCategories";
import "../bindingHandlers/readOnly";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";
import { ApiAppCategoryContract } from "../../services/apiAppCategoryContract";
import { ApiAppScopeGroupContract } from "../../services/apiAppScopeGroupContract";
import { ApiAppScopesVersionContract } from "../../services/apiAppScopesVersionContract";
import { ApiAppAvailabilityCreateOrUpdateContract } from "../../services/apiAppAvailabilityCreateOrUpdateContract";
import { ApiAppCreateOrUpdateContract } from "../../services/apiAppCreateOrUpdateContract";
import { SecretManagementOption } from "../../services/secretManagementOption";
import "./modal";

declare global {
    interface ReadonlySetLike<T> {
        readonly size: number;
        keys(): Iterator<T>;
        has(value: T): boolean;
    }

    interface Set<T> {
        union<U>(other: ReadonlySetLike<U>): Set<T | U>;
    }
}

export class ApiAppEditorVm {
    public emailAddressMaxLength: number = 100;
    public descriptionMaxLength: number = 10000;
    private maxTenants: number = 4000;
    private maxNetworks: number = 15;
    public id: number;
    public publicId: string;
    public applicationKey1: string;
    public readScopeNames: ko.PureComputed<string>;
    public writeScopeNames: ko.PureComputed<string>;
    public name: ko.Observable<string>;
    public organizationName: ko.Observable<string>;
    public homepageUrl: ko.Observable<string>;
    public emailAddress: ko.Observable<string>;
    public isPublicApp: ko.Observable<boolean | null>;
    public isMarketplaceApp: ko.Observable<boolean>;
    public description: ko.Observable<string>;
    public appCategoryId: ko.Observable<number | null>;
    public externalDataGuid: ko.Observable<string>;
    public scopesVersions: Array<ApiAppScopesVersionContract>;
    public selectedScopesVersion: ko.Observable<ApiAppScopesVersionContract>;
    public editingAuthScopes: ko.Observable<boolean>;
    public enabledAuthScopes: Set<string>;
    public existingBlockedAuthScopes: Map<string, string>; // scope:[rw] => displayName
    public enabledScopeGroups: Set<string>;
    public hasBlockedAuthScopes: boolean;
    public authScopes: ko.ObservableArray<string>;
    public deleted: ko.Observable<boolean>;
    public tenantAppAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>;
    public networkAppAvailabilityList: ko.ObservableArray<ApiAppAvailabilityCreateOrUpdateContract>;
    public secretManagementOption: ko.Observable<SecretManagementOption>;
    public validationActivated: ko.Observable<boolean>;
    public nameValidation: ko.PureComputed<string>;
    public organizationNameValidation: ko.PureComputed<string>;
    public homepageUrlValidation: ko.PureComputed<string>;
    public emailAddressValidation: ko.PureComputed<string>;
    public isPublicAppValidation: ko.PureComputed<string>;
    public descriptionValidation: ko.PureComputed<string>;
    public appCategoryIdValidation: ko.PureComputed<string>;
    public externalDataGuidValidation: ko.PureComputed<string>;
    public authScopesValidation: ko.PureComputed<string>;
    public tenantAppAvailabilityValidation: ko.PureComputed<string>;
    public networkAppAvailabilityValidation: ko.PureComputed<string>;
    public isValid: ko.PureComputed<boolean>;
    public saveButtonEnabled: ko.PureComputed<boolean>;
    public errorMessage: ko.Observable<string>;
    public isLoading: ko.Observable<boolean>;
    public newMarketplaceFieldsBannerVisible: boolean;
    public allScopeGroups: Array<ApiAppScopeGroupContract>;
    public confirmDelete: ko.Observable<boolean>;
    public confirmScopeRemoval: ko.Observable<boolean>;
    public removedExistingBlockedAuthScopes: ko.Observable<[string, string][]>;
    private close: () => Promise<void>;

    constructor(
        private apiAppsService: ApiAppsService,
        apiApp: ApiAppContract,
        private projectId: string,
        public isThirdPartyDeveloper: boolean,
        allScopeGroups: Array<ApiAppScopeGroupContract>,
        public appCategories: Array<ApiAppCategoryContract>,
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
        this.emailAddress = ko.observable(apiApp.emailAddress);
        this.isPublicApp = ko.observable(isThirdPartyDeveloper && apiApp.isPublicApp);
        this.isMarketplaceApp = ko.observable(apiApp.isMarketplaceApp);
        this.description = ko.observable(apiApp.description);
        this.appCategoryId = ko.observable(apiApp.appCategoryId);
        this.scopesVersions = apiApp.scopesVersions;
        this.selectedScopesVersion = ko.observable(apiApp.scopesVersions[0]);
        this.editingAuthScopes = ko.observable(apiApp.id === 0);
        const existingAuthScopes = new Map<string, string>(apiApp.authScopes
            .map(scope => [
                ...scope.read ? [[scope.name + ":r", scope.displayName]] as const : [],
                ...scope.write ? [[scope.name + ":w", scope.displayName]] as const : []
            ])
            .flat());
        this.enabledAuthScopes = new Set<string>(allScopeGroups
            .map(scopeGroup => scopeGroup.scopes
                .map(scope => [
                    ...scope.canRead ? [scope.name + ":r"] : [],
                    ...scope.canWrite ? [scope.name + ":w"] : [],
                ]))
            .flat(2));
        this.existingBlockedAuthScopes = new Map<string, string>([...existingAuthScopes]
            .filter(entry => !this.enabledAuthScopes.has(entry[0])));
        this.enabledAuthScopes = this.enabledAuthScopes.union(existingAuthScopes);
        this.enabledScopeGroups = new Set<string>([...this.enabledAuthScopes]
            .map(authScope => authScope.substring(0, authScope.indexOf(".", authScope.indexOf(".") + 1))));
        this.hasBlockedAuthScopes = allScopeGroups.some(scopeGroup =>
            scopeGroup.scopes.some(scope =>
                (scope.hasRead && !this.enabledAuthScopes.has(scope.name + ":r") ||
                (scope.hasWrite && !this.enabledAuthScopes.has(scope.name + ":w")))));
        this.authScopes = ko.observableArray([...existingAuthScopes.keys()]);
        this.readScopeNames = ko.pureComputed(() =>
            this.selectedScopesVersion().authScopes.filter(s => s.read).map(s => s.displayName).join(", ")
        );
        this.writeScopeNames = ko.pureComputed(() =>
            this.selectedScopesVersion().authScopes.filter(s => s.write).map(s => s.displayName).join(", ")
        );
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
        this.secretManagementOption = ko.observable(apiApp.secretManagementOption);
        this.isLoading = ko.observable(false);
        this.newMarketplaceFieldsBannerVisible = apiApp.id > 0 && !apiApp.deleted &&
            (!apiApp.emailAddress || apiApp.isPublicApp === null || !apiApp.description || !apiApp.appCategoryId);
        this.allScopeGroups = allScopeGroups;
        this.confirmDelete = ko.observable(false);
        this.confirmScopeRemoval = ko.observable(false);
        this.removedExistingBlockedAuthScopes = ko.observableArray([]);
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
            const name = this.name().trim();
            if (name.length == 0) return "Application name is empty";
            if (name.length > 120) return "Application name is more than 120 chars";
            return "";
        });
        this.organizationNameValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const name = this.organizationName().trim();
            if (name.length == 0) return "Organization name is empty";
            if (name.length > 120) return "Organization name is more than 120 chars";
            return "";
        });
        this.homepageUrlValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const url = this.homepageUrl().trim();
            if (url.length == 0) return "Url is empty";
            try {
                new URL(url);
            } catch (e) {
                return "Url is not valid";
            }
            return "";
        });
        this.emailAddressValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const emailAddress = this.emailAddress().trim();
            if (emailAddress.length == 0) return "Email address is empty";
            if (emailAddress.length > this.emailAddressMaxLength) return `Email address is more than ${this.emailAddressMaxLength} chars`;
            return /^\s*[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\s*$/.test(emailAddress)
                ? ""
                : "Email address is not valid";
        })
        this.isPublicAppValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            return this.isPublicApp() !== null ? "" : "Option is not selected";
        });
        this.descriptionValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const description = this.description().trim();
            if (description.length == 0) return "Description is empty";
            if (description.length > this.descriptionMaxLength) return `Description is more than ${this.descriptionMaxLength} chars`;
            return "";
        });
        this.appCategoryIdValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            return this.appCategoryId() !== null ? "" : "Category is not selected";
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
            const tenantList = this.tenantAppAvailabilityList();
            const networkList = this.networkAppAvailabilityList();
            if (tenantList.length == 0 && networkList.length == 0) return "Tenants list and networks list are empty";
            if (tenantList.length > this.maxTenants) return `Tenants list contains more than ${this.maxTenants} items`;
            return "";
        });
        this.networkAppAvailabilityValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const list = this.networkAppAvailabilityList();
            if (list.length > this.maxNetworks) return `Networks list contains more than ${this.maxNetworks} items`;
            return "";
        });

        this.isValid = ko.pureComputed(() =>
            this.nameValidation().length == 0 &&
            this.organizationNameValidation().length == 0 &&
            this.homepageUrlValidation().length == 0 &&
            this.emailAddressValidation().length == 0 &&
            this.isPublicAppValidation().length == 0 &&
            this.descriptionValidation().length == 0 &&
            this.appCategoryIdValidation().length == 0 &&
            this.authScopesValidation().length == 0 &&
            this.tenantAppAvailabilityValidation().length == 0 &&
            this.networkAppAvailabilityValidation().length == 0 &&
            this.externalDataGuidValidation().length == 0
        );
        this.saveButtonEnabled = ko.pureComputed(() =>
            !this.validationActivated() || this.isValid());
    }

    public clickEditAuthScopes() {
        this.editingAuthScopes(true);
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
            window.scroll({ top: 150, left: 0, behavior: "smooth" });
            return;
        }
        if (this.confirmScopeRemoval()) {
            this.confirmScopeRemoval(false);
        } else {
            const newAuthScopes = new Set<string>(this.authScopes());
            const removedExistingBlockedAuthScopes = [...this.existingBlockedAuthScopes]
                .filter(entry => !newAuthScopes.has(entry[0]));
            if (removedExistingBlockedAuthScopes.length > 0) {
                this.removedExistingBlockedAuthScopes(removedExistingBlockedAuthScopes);
                this.confirmScopeRemoval(true);
                return;
            }
        }
        this.isLoading(true);
        const apiApp: ApiAppCreateOrUpdateContract = {
            id: this.id,
            name: this.name().trim(),
            organizationName: this.organizationName().trim(),
            homepageUrl: this.homepageUrl().trim(),
            emailAddress: this.emailAddress().trim(),
            isPublicApp: this.isPublicApp(),
            isMarketplaceApp: this.isMarketplaceApp(),
            description: this.description().trim(),
            appCategoryId: this.appCategoryId(),
            authScopes: this.authScopes(),
            externalDataGuid: this.externalDataGuid(),
            deleted: this.deleted(),
            tenantAppAvailabilityList: this.tenantAppAvailabilityList(),
            networkAppAvailabilityList: this.networkAppAvailabilityList(),
            secretManagementOption: this.secretManagementOption(),
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
            )
            .filter(authScope => this.enabledAuthScopes.has(authScope));
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

    public async clickCancelScopeRemoval() {
        this.confirmScopeRemoval(false);
    }

    public async clickCancel() {
        await this.close();
    }
}