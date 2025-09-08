import { AccessControl } from 'accesscontrol';
import { Inject, Service } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';
import { PermissionInterface } from '../../lib/core/permission_interface';

type Operation = 'create:any' | 'read:any' | 'update:any' | 'delete:any' |
    'create:own' | 'read:own' | 'update:own' | 'delete:own';

@Service('rbac')
export class RbacService {
    private _accessControl: AccessControl;

    constructor(@Inject('config')
    private _config: ConfigSchema) {
        this._accessControl = new AccessControl(_config.roles.capabilities);
    }

    /**
     * Check what permissions role has to perform operation on resource.
     * @param role The role to perform the check on
     * @param operation The operation the role wish to perform on resource. Allowed values: 'create:any', 'read:any',
     * 'update:any', 'delete:any', 'create:own', 'read:own', 'update:own', 'delete:own'
     * @param resource The name of the resource the role wish to perform operation on
     * @return Return an object compatible with PermissionInterface
     */
    public can(role: string,
        operation: Operation,
        resource: string): PermissionInterface {
        const checkRole = this._accessControl.can(role);
        const operationFunction = this._makeAccessControlMethod(operation);

        return checkRole[operationFunction]
            ? checkRole[operationFunction].call(checkRole, resource)
            : { granted: false } as PermissionInterface;;
    }

    /* PRIVATE */
    private _makeAccessControlMethod(operation: Operation): string {
        return operation
            .replace(/:./, operation[operation.indexOf(':') + 1].toUpperCase());
    }
}
