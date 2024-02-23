import { ApiAppScopeSelectContract } from "./apiAppScopeSelectContract";
import { ApiAppScopesVersionContract } from "./apiAppScopesVersionContract";
import { ApiAppAvailabilityContract } from "./apiAppAvailabilityContract";
import { SecretManagementOption } from "./secretManagementOption";

export interface ApiAppContract {
    id: number;
    publicId: string;
    name: string;
    organizationName: string;
    homepageUrl: string;
    emailAddress: string;
    isThirdPartyDeveloper: boolean | null;
    isPublicApp: boolean | null;
    isMarketplaceApp: boolean;
    description: string;
    scopesVersions: Array<ApiAppScopesVersionContract>;
    authScopes: Array<ApiAppScopeSelectContract>;
    applicationKey1: string;
    externalDataGuid: string;
    deleted: boolean;
    tenantAppAvailabilityList: Array<ApiAppAvailabilityContract>;
    networkAppAvailabilityList: Array<ApiAppAvailabilityContract>;
    secretManagementOption: SecretManagementOption;
}