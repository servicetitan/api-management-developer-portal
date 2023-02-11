import { ApiAppScopeDisplayContract } from "./apiAppScopeDisplayContract"

export interface ApiAppScopeGroupContract {
    name: string;
    displayName: string;
    scopes: Array<ApiAppScopeDisplayContract>;
}