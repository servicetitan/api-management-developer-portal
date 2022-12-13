import { ApiAppAvailabilityCreateOrUpdateContract } from "./apiAppAvailabilityCreateOrUpdateContract";

export interface ApiAppCreateOrUpdateContract {
    id: number;
    name: string;
    organizationName: string;
    homepageUrl: string;
    authScopes: Array<string>;
    externalDataAppGuid: string;
    deleted: boolean;
    tenantAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
    networkAppAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
}