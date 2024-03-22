import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";

function parseYYYYMMDD(date: string): Date {
    return new Date(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
}

export class ApiAppApiUsageReportVm {
    public id: number;
    public publicId: string;
    public name: string;
    public createdOn: Date;
    public minDate: Date;

    constructor(
        private apiAppsService: ApiAppsService,
        apiApp: ApiAppContract,
        private projectId: string,
        private close: () => Promise<void>
    ) {
        this.id = apiApp.id;
        this.publicId = apiApp.publicId;
        this.name = apiApp.name;
        this.createdOn = parseYYYYMMDD(apiApp.createdOn);
        this.minDate = parseYYYYMMDD(apiApp.apiUsageReportMinDate);
    }

    public async clickBack() {
        await this.close();
    }
}
