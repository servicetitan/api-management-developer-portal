import { ApiAppClientSecretContract } from "./apiAppClientSecretContract";

export interface ApiAppClientContract {
    environmentId: string;
    environmentName: string;
    resourceOwnerTerm: string | null;
    resourceOwner: string;
    clientId: string;
    clientSecrets: ApiAppClientSecretContract[];
    currentScopesVersion: number;
    enabled: boolean;
}
