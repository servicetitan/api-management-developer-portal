import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiClientsEditorViewModel } from "./ko/apiClientsEditorViewModel";
import { ApiClientsHandlers } from "./apiClientsHandlers";
import { ApiClientsViewModel, ApiClientsViewModelBinder } from "./ko";
import { ApiClientsModelBinder } from "./apiClientsModelBinder";
import { ApiClientsService } from "./services/apiClientsService"
/**
 * Inversion of control module that registers design-time dependencies.
 */
export class ApiClientsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apiClients", ApiClientsViewModel);
        injector.bind("apiClientsEditor", ApiClientsEditorViewModel);
        injector.bindToCollection("modelBinders", ApiClientsModelBinder);
        injector.bindToCollection("viewModelBinders", ApiClientsViewModelBinder);
        injector.bindToCollection("widgetHandlers", ApiClientsHandlers);
        injector.bind("apiClientsService", ApiClientsService);
    }
}