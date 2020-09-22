import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import { ApiClientEditContract } from "./apiClientEditContract";
import { ApiClientEnvironment } from "./apiClientEnvironment";
import { ApiClientsPageContract } from "./apiClientsPageContract";
import { IAuthenticator } from "../../../../src/authentication";

export class ApiClientsService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
    ) { }

    public async getApiClients(): Promise<ApiClientsPageContract> {
        const request: HttpRequest = {
            url: "/c/apiclients",
            method: "GET",
            headers: []
        }
        return await this.makeRequest(request);
    }

    public async editApiClient(
        environment: ApiClientEnvironment,
        id: number,
        apiClient: ApiClientEditContract
    ) {
        const request: HttpRequest = {
            url: `/c/apiclients/${environment}/${id}`,
            method: "PUT",
            headers: [
                { name: "Content-Type", value: "application/json" }
            ],
            body: JSON.stringify(apiClient)
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