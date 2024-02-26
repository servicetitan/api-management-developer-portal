export interface ApiAppCategoryContract {
    id: number;
    name: string;
    children: ApiAppCategoryContract[];
}
