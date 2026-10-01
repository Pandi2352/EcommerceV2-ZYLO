import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SEED_ROLES } from './seeds/roles.seed';

@Injectable()
export class RolesSeedService implements OnModuleInit {
  private readonly logger = new Logger(RolesSeedService.name);

  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  async seedRoles(): Promise<{ created: number; existing: number }> {
    let created = 0;
    let existing = 0;

    for (const def of SEED_ROLES) {
      const found = await this.roleModel.findOne({ key: def.key });
      if (!found) {
        await this.roleModel.create({
          name: def.name,
          key: def.key,
          description: def.description,
          permissions: def.permissions,
          status: def.status,
          isSystem: def.isSystem,
        });
        created++;
      } else {
        existing++;
        // Maintain system role guarantees
        if (def.key === 'super_admin' && (!found.isSystem || found.permissions[0] !== '*')) {
          await this.roleModel.updateOne(
            { _id: found._id },
            { $set: { isSystem: true, permissions: ['*'] } },
          );
        } else if (def.isSystem && !found.isSystem) {
          await this.roleModel.updateOne({ _id: found._id }, { $set: { isSystem: true } });
        }
      }
    }

    this.logger.log(`Roles seed check: ${created} created, ${existing} existing/verified`);
    return { created, existing };
  }
}
