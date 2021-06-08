import { ApiAppAvailabilityCreateOrUpdateContract } from "./apiAppAvailabilityCreateOrUpdateContract";

export interface ApiAppCreateOrUpdateContract {
    id: number;
    name: string;
    organizationName: string;
    homepageUrl: string;
    authScopes: Array<string>;
    deleted: boolean;
    appAvailabilityList: Array<ApiAppAvailabilityCreateOrUpdateContract>;
}