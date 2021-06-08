import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { ApiAppsViewModel } from "./apiAppsViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ApiAppsModel } from "../apiAppsModel";



/**
 * This class describes how the model needs to be presented (as a view model)
 * in a specific UI framework.
 */
export class ApiAppsViewModelBinder implements ViewModelBinder<ApiAppsModel, ApiAppsViewModel>  {
    constructor(private readonly eventManager: EventManager) { }

    public async updateViewModel(model: ApiAppsModel, viewModel: ApiAppsViewModel): Promise<void> {
        // viewModel.property(model.value)
    }

    public async modelToViewModel(model: ApiAppsModel, viewModel?: ApiAppsViewModel, bindingContext?: Bag<any>): Promise<ApiAppsViewModel> {
        if (!viewModel) {
            viewModel = new ApiAppsViewModel();

            const binding: IWidgetBinding<ApiAppsModel, ApiAppsViewModel> = {
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

    public canHandleModel(model: ApiAppsModel): boolean {
        return model instanceof ApiAppsModel;
    }
}