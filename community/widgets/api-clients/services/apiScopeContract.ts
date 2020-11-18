export interface ApiScopeContract
{
    name: string;
    displayName: string;
    authClaims: Array<string>;
    accessGroup: string;
}