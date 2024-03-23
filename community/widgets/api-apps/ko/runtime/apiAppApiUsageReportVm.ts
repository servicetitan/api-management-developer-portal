import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";
import "./modal";

// Attempts to parse a user-entered date in the format MM/DD/YYYY (with - and . also allowed as separators)
function parseDate(value: string): Date {
    const match = value.match(/^\s*(\d{1,2})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{4})\s*$/);
    if (match) {
        value =`${match[3]}-${("0" + match[1]).slice(-2)}-${("0" + match[2]).slice(-2)}`; // YYYY-MM-DD
        const date = new Date(value); // midnight UTC
        if (!isNaN(+date) && date.toISOString().slice(0, 10) === value) // date is valid and wasn't adjusted?
            return new Date(`${value}T00:00:00`); // midnight local
    }
    return new Date(NaN); // invalid date
}

export class ApiAppApiUsageReportVm {
    public id: number;
    public publicId: string;
    public name: string;
    public createdOn: Date;
    public minDate: Date;
    public startDate: ko.Observable<string>;
    public startDateParsed: ko.PureComputed<Date>;
    public startDateValidation: ko.PureComputed<string>;
    public endDate: ko.Observable<string>;
    public endDateParsed: ko.PureComputed<Date>;
    public endDateValidation: ko.PureComputed<string>;
    public validationActivated: ko.Observable<boolean>;
    public isValid: ko.PureComputed<boolean>;
    public isDownloading: ko.Observable<boolean>;
    public noDataModalVisible: ko.Observable<boolean>;

    constructor(
        private apiAppsService: ApiAppsService,
        apiApp: ApiAppContract,
        private projectId: string,
        private close: () => Promise<void>
    ) {
        this.id = apiApp.id;
        this.publicId = apiApp.publicId;
        this.name = apiApp.name;
        this.createdOn = new Date(apiApp.createdOn);
        this.minDate = new Date(apiApp.apiUsageReportMinDate);
        this.startDate = ko.observable("");
        this.startDateParsed = ko.pureComputed(() => parseDate(this.startDate()));
        this.startDateValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const startDate = this.startDateParsed();
            if (isNaN(+startDate)) return "Enter a valid date (MM/DD/YYYY).";
            if (startDate < this.minDate)
                return `The Start Date cannot be earlier than ${this.minDate.toLocaleDateString()}.`;
            return "";
        });
        this.endDate = ko.observable("");
        this.endDateParsed = ko.pureComputed(() => parseDate(this.endDate()));
        this.endDateValidation = ko.pureComputed(() => {
            if (!this.validationActivated()) return "";
            const endDate = this.endDateParsed();
            if (isNaN(+endDate)) return "Enter a valid date (MM/DD/YYYY).";
            if (endDate < this.startDateParsed())
                return "The End Date cannot be earlier than the Start Date.";
            if (endDate > new Date())
                return "The End Date cannot be later than today.";
            return "";
        });
        this.validationActivated = ko.observable(false);
        this.isValid = ko.pureComputed(() => 
            this.startDateValidation() === "" &&
            this.endDateValidation() === ""
        );
        this.isDownloading = ko.observable(false);
        this.noDataModalVisible = ko.observable(false);
    }

    public async clickBack() {
        await this.close();
    }

    public async clickDownload() {
        this.validationActivated(true);
        if (!this.isValid()) {
            return;
        }

        this.isDownloading(true);
        try {
            const report = await this.apiAppsService.getApiUsageReport(
                this.projectId, this.id, this.startDateParsed(), this.endDateParsed());
            const tenants = Object.entries(report.tenants);
            if (tenants.length === 0) {
                this.noDataModalVisible(true);
                return;
            }

            const content = [
                [
                    "App ID",
                    "Tenant Name",
                    "Tenant ID",
                    "API Name",
                    "HTTP Method",
                    "Endpoint Name",
                    "Successful Calls",
                ].join(","),
                ...tenants
                    .map(tenantEntry =>
                        report.endpoints
                            .map((endpoint, endpointIndex) => ({
                                endpoint,
                                successfulCallCount:
                                    tenantEntry[1].successfulCallCounts[endpointIndex],
                            }))
                            .filter(({ successfulCallCount }) => successfulCallCount > 0)
                            .map(({ endpoint, successfulCallCount }) =>
                                [
                                    this.publicId,
                                    tenantEntry[1].name,
                                    tenantEntry[0],
                                    endpoint.apiName,
                                    endpoint.httpMethod,
                                    endpoint.endpointName,
                                    successfulCallCount.toString(),
                                ].join(",")
                            )
                    )
                    .flat(1),
                "",
            ].join("\n");
            const blob = new Blob([content], { type: "text/csv", endings: "native" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download =
                [
                    this.name.replace(/[^- .,0-9A-Z]/gi, "_"),
                    this.publicId,
                    report.firstBinDateTime.replace(/[-T:]/gi, "").slice(0, -2),
                    report.lastBinDateTime.replace(/[-T:]/gi, "").slice(0, -2),
                ].join("_") + ".csv";
            document.body.appendChild(anchor);
            anchor.click();
            setTimeout(() => {
                document.body.removeChild(anchor);
                URL.revokeObjectURL(url);
            }, 0);
        }
        finally {
            this.isDownloading(false);
        }
    }

    public clickCloseNoDataModal() {
        this.noDataModalVisible(false);
    }
}
