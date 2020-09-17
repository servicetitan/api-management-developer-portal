import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiClientsRuntime } from "./ko/runtime/api-clients-runtime";
import { ApiClientsService } from "./services/apiClientsService"

/**
 * Inversion of control module that registers runtime-time dependencies.
 */
export class ApiClientsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiClientsRuntime", ApiClientsRuntime);
        injector.bind("apiClientsService", ApiClientsService);
    }
}