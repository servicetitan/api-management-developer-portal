export interface ApiAppApiUsageReportContract {
    firstBinDateTime: string; // YYYY-MM-DDTHH:mm:ss
    lastBinDateTime: string; // YYYY-MM-DDTHH:mm:ss
    endpoints: {
        apiName: string;
        httpMethod: string;
        endpointName: string;
    }[];
    tenants: {
        [id: string]: {
            name: string;
            successfulCallCounts: number[];
        };
    };
}
