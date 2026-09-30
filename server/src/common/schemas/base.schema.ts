import { Prop, Schema } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard Base Schema for all MongoDB Collections in ZYLO.
 * Enforces UUID v4 primary keys (_id) instead of default ObjectId,
 * automatic timestamp auditing (createdAt, updatedAt), and document versioning (__v).
 */
@Schema({
  timestamps: true,
  versionKey: '__v',
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
      // Expose clean 'id' matching '_id' and strip internal mongo properties if preferred
      ret.id = ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id;
      return ret;
    },
  },
})
export abstract class BaseSchema {
  /**
   * Primary key formatted as RFC 4122 UUID v4
   */
  @Prop({
    type: String,
    default: () => uuidv4(),
  })
  _id: string;

  /**
   * Virtual getter for clean property access
   */
  get id(): string {
    return this._id;
  }

  /**
   * Creation timestamp (managed automatically by Mongoose)
   */
  createdAt?: Date;

  /**
   * Last updated timestamp (managed automatically by Mongoose)
   */
  updatedAt?: Date;

  /**
   * Document version key (for optimistic concurrency control)
   */
  __v?: number;
}
