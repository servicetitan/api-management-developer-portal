import * as ko from "knockout";
import * as Constants from "../../../../../constants";
import template from "./operation-list.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { Operation } from "../../../../../models/operation";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { TagGroup } from "../../../../../models/tagGroup";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Tag } from "../../../../../models/tag";
import { Api } from "../../../../../models/api";


@RuntimeComponent({
    selector: "operation-list"
})
@Component({
    selector: "operation-list",
    template: template
})
export class OperationList {
    private searchRequest: SearchQuery;

    private static readonly hiddenEndpoints: Set<string> = new Set<string>([
        'PUT {tenant}/jobs/{id}/hold',
        'PUT {tenant}/jobs/{id}/complete',
        'POST {tenant}/jobs/{id}/messages',
        'POST {tenant}/jobs/{job}/timesheets',
        'PUT {tenant}/jobs/{job}/timesheets/{id}',
        'GET {tenant}/optinouts/optouts',
        'POST {tenant}/optinouts/optouts',
        'POST {tenant}/optinouts/optouts/getlist',
        'POST {tenant}/payments',
        'POST {tenant}/projects/{id}/messages',
        'POST tn.dis.technician-arrived',
    ]);

    public readonly selectedApiName: ko.Observable<string>;
    public readonly selectedOperationName: ko.Observable<string>;
    public readonly operations: ko.ObservableArray<Operation>;
    public readonly working: ko.Observable<boolean>;
    public readonly groupByTag: ko.Observable<boolean>;
    public readonly groupTagsExpanded: ko.Observable<Set<string>>;
    public readonly operationGroups: ko.ObservableArray<TagGroup<Operation>>;
    public readonly pattern: ko.Observable<string>;
    public readonly tags: ko.Observable<Tag[]>;
    public readonly pageNumber: ko.Observable<number>;
    public readonly nextPage: ko.Observable<boolean>;
    public readonly tagScope: ko.Computed<string>;
    public readonly showUrlPath: ko.Observable<boolean>;
    public readonly apiType: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.detailsPageUrl = ko.observable();
        this.allowSelection = ko.observable(false);
        this.wrapText = ko.observable();

        this.showUrlPath = ko.observable();
        this.defaultShowUrlPath = ko.observable();
        this.showToggleUrlPath = ko.observable();

        this.operations = ko.observableArray();
        this.operationGroups = ko.observableArray();
        this.selectedApiName = ko.observable();
        this.selectedOperationName = ko.observable().extend(<any>{ acceptChange: this.allowSelection });
        this.working = ko.observable(false);
        this.groupByTag = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.groupTagsExpanded = ko.observable(new Set<string>());
        this.defaultAllGroupTagsExpanded = ko.observable(false);
        this.pattern = ko.observable();
        this.tags = ko.observable([]);
        this.pageNumber = ko.observable(1);
        this.nextPage = ko.observable();

        this.tagScope = ko.computed(() => this.selectedApiName() ? `apis/${this.selectedApiName()}` : "");
        this.apiType = ko.observable();
    }

    @Param()
    public allowSelection: ko.Observable<boolean>;

    @Param()
    public wrapText: ko.Observable<boolean>;

    @Param()
    public defaultShowUrlPath: ko.Observable<boolean>;

    @Param()
    public showToggleUrlPath: ko.Observable<boolean>;

    @Param()
    public defaultGroupByTagToEnabled: ko.Observable<boolean>;

    @Param()
    public defaultAllGroupTagsExpanded: ko.Observable<boolean>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        this.selectedApiName(apiName);
        this.selectedOperationName(operationName);

        this.groupByTag(this.defaultGroupByTagToEnabled());
        this.tags.subscribe(this.resetSearch);

        this.showUrlPath(this.defaultShowUrlPath());

        if (this.selectedApiName()) {
            await this.loadOperations();
        }

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.groupByTag
            .subscribe(this.loadOperations);

        this.router.addRouteChangeListener(this.onRouteChange);

        this.pageNumber
            .subscribe(this.loadOperations);

        if (this.defaultAllGroupTagsExpanded()) {
            const groups = new Set<string>()
            this.operationGroups().map(g => {groups.add(g.tag)})
            this.groupTagsExpanded(groups);
        }
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            this.selectedOperationName(null);
            await this.resetSearch();
            return;
        }

        if (operationName !== this.selectedOperationName()) {
            this.selectedOperationName(operationName);
        }
    }

    public async loadOperations(): Promise<void> {
        if (this.groupByTag()) {
            this.operationGroups([]);
            this.searchRequest = { pattern: this.pattern(), tags: this.tags(), grouping: "tag" };
        }
        else {
            this.operations([]);
            this.searchRequest = { pattern: this.pattern(), tags: this.tags(), grouping: "none" };
        }

        this.searchRequest.propertyName = this.showUrlPath() ? "urlTemplate" : undefined;

        try {
            this.working(true);
            const apiType = await this.getApiType();
            if (apiType === "websocket") {
                await this.loadPageOfOperations();
                this.selectFirstOperation();
            } else {
                if (this.groupByTag()) {
                    await this.loadOfOperationsByTag();
                }
                else {
                    await this.loadPageOfOperations();
                }

                if (this.allowSelection() && !this.selectedOperationName()) {
                    this.selectFirstOperation();
                }
            }
        }
        catch (error) {
            throw new Error(`Unable to load operations: Error: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }

    private async getApiType(): Promise<string> {
        const apiName = this.selectedApiName();

        if (!apiName) {
            return;
        }
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.apiType(api?.type);

        return api?.type;
    }

    private async loadOfOperationsByTag(): Promise<void> {
        const apiName = this.selectedApiName();
        if (!apiName) {
            return;
        }

        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;

        const pageOfOperationsByTag = await this.apiService.getOperationsByTags(apiName, this.searchRequest);
        const operationGroups = pageOfOperationsByTag.value;

        operationGroups.sort((a, b) => {
            if (a.tag !== "Export" && b.tag === "Export") {
                return 1;
            } else if (a.tag === "Export" && b.tag !== "Export") {
                return -1;
            } else {
                return (a.tag || "").localeCompare(b.tag || "");
            }
        });

        const adjustUrl = apiName.endsWith("-webhooks")
            ? (urlTemplate: string) => urlTemplate.replace(/^\//, "") // Remove the initial "/".
            : apiName.startsWith("tenant-")
            ? (urlTemplate: string) => urlTemplate
                .replace(/^\/(v\d+\/)?tenant\/(\{tenant\}\/(booking-provider|gps-provider|report-category)\/)?/, "")
                // Remove the initial "/".
                // Remove the "v#/" path segment if present.
                // Remove the "tenant/" path segment.
                // Remove the "{tenant}/" path segment if followed by booking-provider/, etc.
            : (urlTemplate: string) => urlTemplate
                .replace('/partner/{partner}/tenant/{tenantId}', '')
                .replace('/partner/{partner}/tenant/{tenant}', '')
                .replace('/partner/{partner}', '')
                .replace('/vendor/{vendor}/supplier/{supplier}', '')
                .replace('/vendor/{vendor}', '')
                .replace('/application/{application}', '');

        operationGroups.forEach(g => {
            g.items.forEach(i => i.urlTemplate = adjustUrl(i.urlTemplate));
            g.items = g.items
                .filter(i => !OperationList.hiddenEndpoints.has(`${i.method} ${i.urlTemplate}`))
                .sort((a, b) => a.urlTemplate > b.urlTemplate ? 1 : -1);
        });

        this.operationGroups(operationGroups.filter(g => g.tag !== 'CustomerOnly' && g.items.length > 0));
        this.groupTagsExpanded(new Set<string>(operationGroups.map(g => g.tag)));
        this.nextPage(!!pageOfOperationsByTag.nextLink);
    }

    private async loadPageOfOperations(): Promise<void> {
        const apiName = this.selectedApiName();
        if (!apiName) {
            return;
        }

        this.searchRequest.skip = (this.pageNumber() - 1) * Constants.defaultPageSize;
        const pageOfOperations = await this.apiService.getOperations(`apis/${apiName}`, this.searchRequest);

        this.operations(pageOfOperations.value);
        this.nextPage(!!pageOfOperations.nextLink);
    }

    public selectOperation(operation: Operation): void {
        this.selectedOperationName(operation.name);

        const operationUrl = this.routeHelper.getOperationReferenceUrl(this.selectedApiName(), operation.name, this.detailsPageUrl());
        this.router.navigateTo(operationUrl);
    }

    private selectFirstOperation(): void {
        let operation: Operation;

        if (this.groupByTag()) {
            const groups = this.operationGroups();

            if (groups.length < 1 || groups[0].items.length < 1) {
                return;
            }

            operation = groups[0].items[0];
        }
        else {
            const operations = this.operations();

            if (operations.length < 1) {
                return;
            }

            operation = operations[0];
        }

        this.selectOperation(operation);
    }

    public getReferenceUrl(operation: Operation): string {
        const apiName = this.routeHelper.getApiName();
        return this.routeHelper.getOperationReferenceUrl(apiName, operation.name, this.detailsPageUrl());
    }

    public async resetSearch(): Promise<void> {
        this.pageNumber(1);
        this.loadOperations();
    }

    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.tags(tags);
    }

    public groupTagCollapseToggle(tag: string): void {
        const newSet = this.groupTagsExpanded();
        newSet.has(tag) ? newSet.delete(tag) : newSet.add(tag);
        this.groupTagsExpanded(newSet);
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}