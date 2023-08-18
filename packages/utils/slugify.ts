import slugify from 'slugify';

export function slugifyForTableName(value: string): string {
  return slugify(value, { replacement: '_', lower: true, strict: true });
}
