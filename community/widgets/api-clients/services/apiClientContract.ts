import { AuthClaimValueContract } from "./authClaimValueContract";

export interface ApiClientContract {
    clientId: string;
    clientSecret1: string;
    clientSecret2: string;
    clientName: string;
    description: string;
    allowedScopes: Array<string>;
    authClaimValues: Array<AuthClaimValueContract>;
    enabled: boolean;
}