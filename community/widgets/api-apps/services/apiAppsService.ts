import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import { ApiAppCreateOrUpdateContract } from "./apiAppCreateOrUpdateContract";
import { ApiAppContract } from "./apiAppContract";
import { ApiAppsPageContract } from "./apiAppsPageContract";
import { IAuthenticator } from "../../../../src/authentication";

export class ApiAppsService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
    ) { }

    public async getApiAppsPage(): Promise<ApiAppsPageContract> {
        const request: HttpRequest = {
            url: "/c/apps",
            method: "GET",
            headers: []
        }
        return await this.makeRequest(request);
    }

    public async createOrUpdateApiClient(
        projectId: string,
        apiApp: ApiAppCreateOrUpdateContract
    ) {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps`,
            method: "PUT",
            headers: [
                { name: "Content-Type", value: "application/json" }
            ],
            body: JSON.stringify(apiApp)
        }
        await this.makeRequest(request);
    }

    private async makeRequest<T>(httpRequest: HttpRequest): Promise<T> {
        const authToken = await this.authenticator.getAccessToken();
        if (authToken) {
            httpRequest.headers.push({ name: "ApimUserAccessToken", value: `${authToken}` });
        }
        try {
            const response = await this.httpClient.send<T>(httpRequest);
            let contentType = "";
            if (response.headers) {
                const contentTypeHeader = response.headers.find(h => h.name.toLowerCase() === "content-type");
                contentType = contentTypeHeader ? contentTypeHeader.value.toLowerCase() : "";
            }
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return contentType.includes("json")
                    ? response.toObject()
                    : <any> response.toText();
            }
            else {
                throw new Error(`${response.statusCode}`);
            }
        }
        catch (error) {
            throw new Error(`Unable to complete request. Try re-login. Error: ${error.message}`);
        }
    }
}