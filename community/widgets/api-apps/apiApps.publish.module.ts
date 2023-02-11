import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiAppsViewModel } from "./ko/apiAppsViewModel";
import { ApiAppsModelBinder } from "./apiAppsModelBinder";
import { ApiAppsViewModelBinder } from "./ko/apiAppsViewModelBinder";

/**
 * Inversion of control module that registers publish-time dependencies.
 */
export class ApiAppsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("apiApps", ApiAppsViewModel);
        injector.bindToCollection("modelBinders", ApiAppsModelBinder);
        injector.bindToCollection("viewModelBinders", ApiAppsViewModelBinder);
    }
}