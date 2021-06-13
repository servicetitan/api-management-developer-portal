import { ApiAppContract } from "./apiAppContract";
import { ApiAppScopeGroupContract } from "./apiAppScopeGroupContract";
import { ApiAppAvailabilityContract } from "./apiAppAvailabilityContract";

export interface ApiAppsPageContract {
    projectId: string;
    apps: Array<ApiAppContract>;
    scopeGroups: Array<ApiAppScopeGroupContract>;
    defaultAvailabilityList: Array<ApiAppAvailabilityContract>;
}