import * as ko from "knockout";
import { ApiAppCategoryContract } from "../../services/apiAppCategoryContract";

function createOptions(
    element: HTMLSelectElement | HTMLOptGroupElement,
    appCategories: ApiAppCategoryContract[]
) {
    appCategories.forEach(appCategory => {
        if (appCategory.children.length > 0) {
            const optGroupElement = element.ownerDocument.createElement("optgroup");
            optGroupElement.label = appCategory.name;
            element.append(optGroupElement);
            createOptions(optGroupElement, appCategory.children);
        } else {
            const optionElement = element.ownerDocument.createElement("option");
            optionElement.value = appCategory.id.toString();
            optionElement.textContent = appCategory.name;
            ko.selectExtensions.writeValue(optionElement, appCategory.id);
            element.append(optionElement);
        }
    });
}

ko.bindingHandlers.appCategories = {
    init: function(element: HTMLSelectElement, valueAccessor: () => ApiAppCategoryContract[]) {
        const emptyOptionElement = element.ownerDocument.createElement("option");
        ko.selectExtensions.writeValue(emptyOptionElement, null);
        element.append(emptyOptionElement);
        createOptions(element, valueAccessor());
    },
};
