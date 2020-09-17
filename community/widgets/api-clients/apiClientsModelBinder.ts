import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { ApiClientsModel } from "./apiClientsModel";
import { Contract } from "@paperbits/common";
import { ApiClientsContract } from "./apiClientsContract";

/**
 * This is a class that helps to prepare the model using data described
 * in the contract.
 */
export class ApiClientsModelBinder implements IModelBinder<ApiClientsModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof ApiClientsModel;
    }

    public async contractToModel(contract: ApiClientsContract): Promise<ApiClientsModel> {
        const model = new ApiClientsModel();
        // model.property = contract.property;
        return model;
    }

    public modelToContract(model: ApiClientsModel): Contract {
        const contract: ApiClientsContract = {
            type: widgetName,
            // property: model.property
        };

        return contract;
    }
}
