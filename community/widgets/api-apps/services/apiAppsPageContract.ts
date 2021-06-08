import { ApiAppContract } from "./apiAppContract";
import { ApiAppScopeGroupContract } from "./apiAppScopeGroupContract";

export interface ApiAppsPageContract {
    projectId: string;
    apps: Array<ApiAppContract>;
    scopeGroups: Array<ApiAppScopeGroupContract>;
}