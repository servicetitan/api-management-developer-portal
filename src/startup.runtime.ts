import { InversifyInjector } from "@paperbits/common/injection";
import { ApimRuntimeModule } from "./apim.runtime.module";
import { ApiClientsRuntimeModule } from "../community/widgets/api-clients/apiClients.runtime.module";

const injector = new InversifyInjector();
injector.bindModule(new ApimRuntimeModule());
injector.bindModule(new ApiClientsRuntimeModule());

document.addEventListener("DOMContentLoaded", () => {
    injector.resolve("autostart");
});

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") && 
        !location.pathname.startsWith("/signup")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
        document.cookie = `returnUrl=${returnUrl}`; // for delegation
    } 
};