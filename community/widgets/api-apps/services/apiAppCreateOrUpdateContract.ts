import { ApiAppAvailabilityCreateOrUpdateContract } from "./apiAppAvailabilityCreateOrUpdateContract";
import { SecretManagementOption } from "./secretManagementOption";

export interface ApiAppCreateOrUpdateContract {
    id: number;
    name: string;
    organizationName: string;
    homepageUrl: string;
    emailAddress: string;
    isPublicApp: boolean;
    isMarketplaceApp: boolean;
    description: string;
    appCategoryId: number;
    authScopes: Array<string>;
    externalDataGuid: string;
    deleted: boolean;
    tenantAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
    networkAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
    secretManagementOption: SecretManagementOption;
}