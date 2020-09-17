export interface ApiClientContract {
    id: number;
    clientId: string;
    name: string;
    grantTypes: string[];
    scopes: string[];
    enabled: boolean;
}