import { Model, Types } from 'mongoose';

/**
 * Generates a clean, URL-safe slug and guarantees uniqueness in MongoDB.
 * Reusable across Categories, Brands, Products, Articles, and Custom Collections.
 *
 * @param model Mongoose model instance to query for collisions
 * @param name Source string to generate slug from
 * @param customSlug Optional manual override slug provided by user
 * @param excludeId Optional document ID to exclude (during update operations)
 * @param fallback Fallback slug if sanitized string is empty (default: 'item')
 */
export async function generateUniqueSlug(
  model: Model<any>,
  name: string,
  customSlug?: string,
  excludeId?: string,
  fallback: string = 'item',
): Promise<string> {
  const baseSlug = (customSlug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slugToUse = baseSlug || fallback;
  let candidate = slugToUse;
  let counter = 1;

  while (true) {
    const query: any = { slug: candidate };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    const existing = await model.findOne(query).select('_id').lean();
    if (!existing) {
      return candidate;
    }
    candidate = `${slugToUse}-${counter}`;
    counter++;
  }
}
