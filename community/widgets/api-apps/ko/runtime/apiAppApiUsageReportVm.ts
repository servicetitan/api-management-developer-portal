import * as ko from "knockout";
import { ApiAppContract } from "../../services/apiAppContract";
import { ApiAppsService } from "../../services/apiAppsService";

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
            return "";
        });
        this.validationActivated = ko.observable(false);
        this.isValid = ko.pureComputed(() => 
            this.startDateValidation() === "" &&
            this.endDateValidation() === ""
        );
    }

    public async clickBack() {
        await this.close();
    }

    public async clickDownload() {
        this.validationActivated(true);
        if (!this.isValid()) {
            return;
        }
    }
}
