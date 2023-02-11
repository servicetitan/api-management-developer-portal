import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { ApiAppsModel } from "./apiAppsModel";
import { Contract } from "@paperbits/common";
import { ApiAppsContract } from "./apiAppsContract";

/**
 * This is a class that helps to prepare the model using data described
 * in the contract.
 */
export class ApiAppsModelBinder implements IModelBinder<ApiAppsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof ApiAppsModel;
    }

    public async contractToModel(contract: ApiAppsContract): Promise<ApiAppsModel> {
        const model = new ApiAppsModel();
        // model.property = contract.property;
        return model;
    }

    public modelToContract(model: ApiAppsModel): Contract {
        const contract: ApiAppsContract = {
            type: widgetName,
            // property: model.property
        };

        return contract;
    }
}
