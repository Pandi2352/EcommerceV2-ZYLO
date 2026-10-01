import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { appConfig, AppConfig } from '../../config/app.config';

const COUNTERS = 'counters';
const PAD = 4;

/**
 * Issues staff User IDs as "<SHOP PREFIX>-<sequence>", e.g. ZY-0004.
 * The sequence lives in a counter document incremented atomically, so concurrent
 * invitations never receive the same code. The first use starts it after the
 * highest code already present (users and invitations).
 */
@Injectable()
export class UserCodeService {
  private initialised = false;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  get prefix(): string {
    return this.app.userCodePrefix;
  }

  async next(): Promise<string> {
    const counterId = `userCode:${this.prefix}`;
    const counters = this.connection.collection<{ _id: string; seq: number }>(COUNTERS);

    if (!this.initialised) {
      // $max never lowers the counter, so this is safe to repeat on every boot
      await counters.updateOne({ _id: counterId }, { $max: { seq: await this.highestExisting() } }, { upsert: true });
      this.initialised = true;
    }

    const doc = await counters.findOneAndUpdate({ _id: counterId }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
    return `${this.prefix}-${String(doc?.seq ?? 1).padStart(PAD, '0')}`;
  }

  /** Highest numeric suffix among existing codes with this prefix. */
  private async highestExisting(): Promise<number> {
    const pattern = new RegExp(`^${this.prefix}-(\\d+)$`);
    const [users, invitations] = await Promise.all([
      this.connection.collection('users').distinct('userCode', { userCode: pattern }),
      this.connection.collection('staff_invitations').distinct('userCode', { userCode: pattern }),
    ]);
    return [...users, ...invitations].reduce((max: number, code: string) => {
      const n = Number(pattern.exec(code)?.[1] ?? 0);
      return n > max ? n : max;
    }, 0);
  }
}
