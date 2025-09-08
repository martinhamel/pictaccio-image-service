export interface PermissionInterface {
    granted: boolean;
    attributes: string[];
    filter: (data: any) => any;
}