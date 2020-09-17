import { ApiClientContract } from "./apiClientContract";

export interface ApiClientsPageContract {
    allScopes: Array<string>;
    allGrantTypes: Array<string>;
    productionApiClients: Array<ApiClientContract>;
    sandboxApiClients: Array<ApiClientContract>;
}