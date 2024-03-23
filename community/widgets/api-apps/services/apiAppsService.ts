import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";
import { ApiAppApiUsageReportContract } from "./apiAppApiUsageReportContract";
import { ApiAppCreateOrUpdateContract } from "./apiAppCreateOrUpdateContract";
import { ApiAppContract } from "./apiAppContract";
import { ApiAppClientContract } from "./apiAppClientContract";
import { ApiAppClientSecretContract } from "./apiAppClientSecretContract";
import { ApiAppsPageContract } from "./apiAppsPageContract";
import { IAuthenticator } from "../../../../src/authentication";

function formatYYYYMMDD(date: Date) {
    return [
        date.getFullYear().toString(),
        ("0" + (date.getMonth() + 1).toString()).slice(-2),
        ("0" + date.getDate().toString()).slice(-2),
    ].join("-");
}

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

    public async getApiAppClients(projectId: string, appId: number): Promise<ApiAppClientContract[]> {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps/${appId}/clients`,
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

    public async getClientSecrets(
        projectId: string, appId: number, environmentId: string, clientId: string
    ): Promise<ApiAppClientSecretContract[]> {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps/${appId}/environments/${environmentId}/clients/${clientId}/secrets`,
            method: "GET",
            headers: []
        }
        return await this.makeRequest(request);
    }

    public async generateClientSecret(
        projectId: string, appId: number, environmentId: string, clientId: string
    ): Promise<string> {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps/${appId}/environments/${environmentId}/clients/${clientId}/secrets`,
            method: "POST",
            headers: []
        }
        return await this.makeRequest(request);
    }

    public async deactivateClientSecret(
        projectId: string, appId: number, environmentId: string, clientId: string, secretId: number
    ): Promise<string> {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps/${appId}/environments/${environmentId}/clients/${clientId}/secrets/${secretId}`,
            method: "DELETE",
            headers: []
        }
        return await this.makeRequest(request);
    }

    public async getApiUsageReport(
        projectId: string,
        appId: number,
        startDate: Date,
        endDate: Date
    ): Promise<ApiAppApiUsageReportContract> {
        const request: HttpRequest = {
            url: `/c/project/${projectId}/apps/${appId}/api-usage-report?startDate=${formatYYYYMMDD(
                startDate
            )}&endDate=${formatYYYYMMDD(endDate)}`,
            method: "GET",
            headers: []
        }
        return this.makeRequest(request);
    }

    private async makeRequest<T>(httpRequest: HttpRequest): Promise<T> {
        const authToken = await this.authenticator.getAccessToken();
        if (authToken) {
            httpRequest.headers.push({ name: "ApimUserAccessToken", value: `${authToken}` });
        }
        else {
            window.open("/signin", "_self");
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
            throw new Error(`Unable to complete request (${error.message}). Please re-login and try again.`);
        }
    }
}