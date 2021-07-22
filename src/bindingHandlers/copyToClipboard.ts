import * as ko from "knockout";

ko.bindingHandlers["copyToClipboard"] = {
    init: (element: HTMLElement, valueAccessor: () => string): void => {
        const copyToClipboard = () => {
            try {
                const text = ko.unwrap(valueAccessor());
                navigator.clipboard.writeText(text).catch(e => { });
            }
            catch (e) { }
        };

        ko.applyBindingsToNode(element, { click: copyToClipboard }, null);
    }
};