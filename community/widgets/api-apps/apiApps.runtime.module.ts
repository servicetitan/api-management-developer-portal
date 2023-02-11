import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiAppsRuntime } from "./ko/runtime/api-apps-runtime";
import { ApiAppsService } from "./services/apiAppsService"


/**
 * Inversion of control module that registers runtime-time dependencies.
 */
export class ApiAppsRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiAppsRuntime", ApiAppsRuntime);
        injector.bind("apiAppsService", ApiAppsService);
    }
}