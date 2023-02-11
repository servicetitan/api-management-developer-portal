import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiAppsEditorViewModel } from "./ko/apiAppsEditorViewModel";
import { ApiAppsHandlers } from "./apiAppsHandlers";
import { ApiAppsViewModel, ApiAppsViewModelBinder } from "./ko";
import { ApiAppsModelBinder } from "./apiAppsModelBinder";
import { ApiAppsService } from "./services/apiAppsService"
/**
 * Inversion of control module that registers design-time dependencies.
 */
export class ApiAppsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiApps", ApiAppsViewModel);
        injector.bind("apiAppsEditor", ApiAppsEditorViewModel);
        injector.bindToCollection("modelBinders", ApiAppsModelBinder);
        injector.bindToCollection("viewModelBinders", ApiAppsViewModelBinder);
        injector.bindToCollection("widgetHandlers", ApiAppsHandlers);
        injector.bind("apiAppsService", ApiAppsService);
    }
}