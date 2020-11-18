import { ServerOnlyClientContract } from "./serverOnlyClientContract";
import { ApiScopeContract } from "./apiScopeContract";
import { AuthClaimValueContract } from "./authClaimValueContract";

export interface ApiClientsEnvironmentContract
{
    availableApiScopes: Array<ApiScopeContract>,
    availableAuthClaims: Array<AuthClaimValueContract>,
    apiClients: Array<ServerOnlyClientContract>;
}