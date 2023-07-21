import { ApiAppAvailabilityCreateOrUpdateContract } from "./apiAppAvailabilityCreateOrUpdateContract";
import { SecretManagementOption } from "./secretManagementOption";

export interface ApiAppCreateOrUpdateContract {
    id: number;
    name: string;
    organizationName: string;
    homepageUrl: string;
    authScopes: Array<string>;
    externalDataGuid: string;
    deleted: boolean;
    tenantAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
    networkAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
    secretManagementOption: SecretManagementOption;
}