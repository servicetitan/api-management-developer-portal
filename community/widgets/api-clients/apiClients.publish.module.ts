import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApiClientsViewModel } from "./ko/apiClientsViewModel";
import { ApiClientsModelBinder } from "./apiClientsModelBinder";
import { ApiClientsViewModelBinder } from "./ko/apiClientsViewModelBinder";


/**
 * Inversion of control module that registers publish-time dependencies.
 */
export class ApiClientsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {        
        injector.bind("apiClients", ApiClientsViewModel);
        injector.bindToCollection("modelBinders", ApiClientsModelBinder);
        injector.bindToCollection("viewModelBinders", ApiClientsViewModelBinder);
    }
}