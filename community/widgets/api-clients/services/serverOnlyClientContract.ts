import { AuthClaimValueContract } from "./authClaimValueContract";

export interface ServerOnlyClientContract {
    clientId: string;
    clientSecret1: string;
    clientSecret2: string;
    clientName: string;
    description: string;
    allowedScopes: Array<string>;
    allowedScopeNames: Array<string>;
    authClaimValues: Array<AuthClaimValueContract>;
    enabled: boolean;
}