import { ApiAppScopeSelectContract } from "./apiAppScopeSelectContract";
import { ApiAppAvailabilityContract } from "./apiAppAvailabilityContract";

export interface ApiAppContract {
    id: number;
    publicId: string;
    name: string;
    organizationName: string;
    homepageUrl: string;
    authScopes: Array<ApiAppScopeSelectContract>;
    applicationKey1: string;
    deleted: boolean;
    appAvailabilityList: Array<ApiAppAvailabilityContract>;
}