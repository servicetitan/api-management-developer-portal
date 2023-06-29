import { ApiAppClientSecretContract } from "./apiAppClientSecretContract";

export interface ApiAppClientContract {
    resourceOwnerTerm: string | null;
    resourceOwner: string;
    clientId: string;
    clientSecrets: ApiAppClientSecretContract[];
    currentScopesVersion: number;
    enabled: boolean;
}
