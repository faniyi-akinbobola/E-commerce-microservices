// libs/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'ADMIN' | 'CUSTOMER' | 'INVENTORY_MANAGER';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
