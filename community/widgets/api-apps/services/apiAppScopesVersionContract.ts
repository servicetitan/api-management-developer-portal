import { ApiAppScopeSelectContract } from "./apiAppScopeSelectContract";

export interface ApiAppScopesVersionContract {
    version: number;
    authScopes: Array<ApiAppScopeSelectContract>;
}