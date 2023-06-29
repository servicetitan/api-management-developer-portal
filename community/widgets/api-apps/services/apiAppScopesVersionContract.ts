import { ApiAppScopeSelectContract } from "./apiAppScopeSelectContract";

export interface ApiAppScopesVersionContract {
    version: number;
    createdOn: string;
    createdBy: string;
    authScopes: Array<ApiAppScopeSelectContract>;
}