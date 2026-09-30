import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaOptions } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

type JsonTransform = (doc: unknown, ret: Record<string, any>) => Record<string, any>;

/** Adds `id` (mirroring the UUID `_id`) and drops the internal version key. */
const toPublicJson: JsonTransform = (_, ret) => {
  ret.id = ret._id;
  delete ret.__v;
  return ret;
};

/**
 * Schema options every collection should use. Subclasses of BaseSchema do NOT
 * inherit the base class's @Schema options, so always build them with this:
 *
 *   @Schema(baseSchemaOptions({ collection: 'products' }))
 *
 * Pass `transform` to post-process JSON further (e.g. strip secrets); the `id`
 * mapping still runs first.
 */
export function baseSchemaOptions(
  options: SchemaOptions & { transform?: JsonTransform } = {},
): SchemaOptions {
  const { transform, ...rest } = options;
  const finalTransform: JsonTransform = (doc, ret) => (transform ? transform(doc, toPublicJson(doc, ret)) : toPublicJson(doc, ret));
  return {
    timestamps: true,
    ...rest,
    toJSON: { virtuals: true, transform: finalTransform },
    toObject: { virtuals: true, transform: finalTransform },
  };
}

/**
 * Standard base for all MongoDB collections in ZYLO: UUID v4 primary keys
 * instead of ObjectId, plus timestamp and version fields.
 */
@Schema(baseSchemaOptions())
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
