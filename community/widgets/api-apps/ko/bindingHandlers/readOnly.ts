import * as ko from "knockout";

ko.bindingHandlers["readOnly"] = {
    update: function (element: HTMLInputElement, valueAccessor: () => boolean | KnockoutObservable<boolean>) {
        const value = !!ko.utils.unwrapObservable(valueAccessor());
        if (element.readOnly !== value) {
            element.readOnly = value;
        }
    }
};
