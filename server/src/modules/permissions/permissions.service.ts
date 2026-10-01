import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';

export interface GroupedPermissionResponse {
  group: string;
  modules: {
    module: string;
    permissions: {
      key: string;
      action: string;
      name: string;
      description: string;
      isSensitive: boolean;
      sortOrder: number;
    }[];
  }[];
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  async getGroupedPermissions(): Promise<GroupedPermissionResponse[]> {
    const permissions = await this.permissionModel
      .find({ deprecated: false })
      .sort({ sortOrder: 1 })
      .lean();

    const groupMap = new Map<string, Map<string, typeof permissions>>();

    for (const p of permissions) {
      if (!groupMap.has(p.group)) {
        groupMap.set(p.group, new Map());
      }
      const modMap = groupMap.get(p.group)!;
      if (!modMap.has(p.module)) {
        modMap.set(p.module, []);
      }
      modMap.get(p.module)!.push(p);
    }

    const result: GroupedPermissionResponse[] = [];
    for (const [group, modMap] of groupMap.entries()) {
      const modules: GroupedPermissionResponse['modules'] = [];
      for (const [module, perms] of modMap.entries()) {
        modules.push({
          module,
          permissions: perms.map((item) => ({
            key: item.key,
            action: item.action,
            name: item.name,
            description: item.description,
            isSensitive: item.isSensitive,
            sortOrder: item.sortOrder,
          })),
        });
      }
      result.push({ group, modules });
    }

    return result;
  }

  async getAllActiveKeys(): Promise<string[]> {
    const list = await this.permissionModel.find({ deprecated: false }).select('key').lean();
    return list.map((p) => p.key);
  }
}
