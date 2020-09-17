export interface ApiClientEditContract {
    clientId: string;
    clientSecret1: string;
    clientSecret2: string;
    name: string;
    grantTypes: string[];
    scopes: string[];
    enabled: boolean;
}