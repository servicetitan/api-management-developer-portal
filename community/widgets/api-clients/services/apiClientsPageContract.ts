import { ApiClientsEnvironmentContract } from "./apiClientsEnvironmentContract";

export interface ApiClientsPageContract {
    isProductionAvailable: boolean,
    sandboxEnvironment: ApiClientsEnvironmentContract,
    productionEnvironment: ApiClientsEnvironmentContract
}