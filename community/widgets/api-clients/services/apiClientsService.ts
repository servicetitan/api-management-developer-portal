import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import { ApiClientEditContract } from "./apiClientEditContract";
import { ApiClientEnvironment } from "./apiClientEnvironment";
import { ApiClientsPageContract } from "./apiClientsPageContract";

export class ApiClientsService {
    constructor(private readonly httpClient: HttpClient) { }

    public async getApiClients(): Promise<ApiClientsPageContract> {
        const request: HttpRequest = {
            url: "/c/apiclients",
            method: "GET"
        }
        const response = await this.httpClient.send<ApiClientsPageContract>(request);
        return response.toObject();
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
        const response = await this.httpClient.send(request);
    }
}