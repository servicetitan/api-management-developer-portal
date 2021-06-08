import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { ApiClientsViewModel } from "./apiClientsViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ApiClientsModel } from "../apiClientsModel";



/**
 * This class describes how the model needs to be presented (as a view model)
 * in a specific UI framework.
 */
export class ApiClientsViewModelBinder implements ViewModelBinder<ApiClientsModel, ApiClientsViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: ApiClientsModel, viewModel: ApiClientsViewModel): Promise<void> {
        // viewModel.property(model.value)
    }

    public async modelToViewModel(model: ApiClientsModel, viewModel?: ApiClientsViewModel, bindingContext?: Bag<any>): Promise<ApiClientsViewModel> {
        if (!viewModel) {
            viewModel = new ApiClientsViewModel();

            const binding: IWidgetBinding<ApiClientsModel, ApiClientsViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
                editor: widgetEditorSelector,
                flow: "block",
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel);
                    this.eventManager.dispatchEvent("onContentUpdate");
                }
            };

            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel);

        return viewModel;
    }

    public canHandleModel(model: ApiClientsModel): boolean {
        return model instanceof ApiClientsModel;
    }
}