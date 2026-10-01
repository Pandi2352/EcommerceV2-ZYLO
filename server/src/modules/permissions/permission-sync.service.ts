import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { getFlattenedCatalog } from './catalog/permissions.catalog';

const KEY_PATTERN = /^[a-z_]+\.[a-z_]+$/;
const ALLOWED_ACTIONS = new Set([
  'view',
  'create',
  'edit',
  'delete',
  'activate',
  'publish',
  'approve',
  'cancel',
  'refund',
  'adjust',
  'invite',
  'assign',
  'import',
  'export',
]);

@Injectable()
export class PermissionSyncService implements OnModuleInit {
  private readonly logger = new Logger(PermissionSyncService.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {}

  async onModuleInit() {
    await this.syncCatalog();
  }

  async syncCatalog(): Promise<{ added: number; updated: number; deprecated: number }> {
    const items = getFlattenedCatalog();
    const seenKeys = new Set<string>();

    // 1. Validation
    for (const item of items) {
      if (!KEY_PATTERN.test(item.key)) {
        throw new Error(`[PermissionSync] Invalid permission key pattern: ${item.key}`);
      }
      if (!ALLOWED_ACTIONS.has(item.action)) {
        throw new Error(`[PermissionSync] Unknown action in permission key: ${item.key} (action: ${item.action})`);
      }
      if (seenKeys.has(item.key)) {
        throw new Error(`[PermissionSync] Duplicate permission key in catalog: ${item.key}`);
      }
      seenKeys.add(item.key);
    }

    let added = 0;
    let updated = 0;

    // 2. Upsert each key into DB
    for (const item of items) {
      const existing = await this.permissionModel.findById(item.key);
      if (!existing) {
        await this.permissionModel.create({
          _id: item.key,
          key: item.key,
          module: item.module,
          action: item.action,
          name: item.name,
          description: item.description,
          group: item.group,
          sortOrder: item.sortOrder,
          isSensitive: item.isSensitive,
          deprecated: false,
        });
        added++;
      } else {
        await this.permissionModel.updateOne(
          { _id: item.key },
          {
            $set: {
              name: item.name,
              description: item.description,
              group: item.group,
              sortOrder: item.sortOrder,
              isSensitive: item.isSensitive,
              deprecated: false,
            },
          },
        );
        updated++;
      }
    }

    // 3. Mark permissions not in catalog as deprecated
    const deprecatedRes = await this.permissionModel.updateMany(
      { _id: { $nin: Array.from(seenKeys) }, deprecated: false },
      { $set: { deprecated: true } },
    );
    const deprecated = deprecatedRes.modifiedCount;

    this.logger.log(
      `Permission catalog synced: ${added} added, ${updated} verified/updated, ${deprecated} deprecated (${items.length} total active keys)`,
    );

    return { added, updated, deprecated };
  }
}
