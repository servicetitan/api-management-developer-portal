import { ApiClientsEnvironmentContract } from "./apiClientsEnvironmentContract";

export interface ApiClientsPageContract {
    isProductionAvailable: boolean,
    practiceEnvironment: ApiClientsEnvironmentContract,
    productionEnvironment: ApiClientsEnvironmentContract
}