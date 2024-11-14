import { ApiAppContract } from "./apiAppContract";
import { ApiAppScopeGroupContract } from "./apiAppScopeGroupContract";
import { ApiAppAvailabilityContract } from "./apiAppAvailabilityContract";
import { ApiAppCategoryContract } from "./apiAppCategoryContract";

export interface ApiAppsPageContract {
    projectId: string;
    isThirdPartyDeveloper: boolean;
    apps: Array<ApiAppContract>;
    scopeGroups: Array<ApiAppScopeGroupContract>;
    defaultTenantAppAvailabilityList: Array<ApiAppAvailabilityContract>;
    appCategories: Array<ApiAppCategoryContract>;
}