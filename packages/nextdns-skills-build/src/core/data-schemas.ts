import * as v from 'valibot';

const NonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));

export const FrontmatterValueSchema = v.union([v.string(), v.array(v.string())]);
export const FrontmatterSchema = v.record(v.string(), FrontmatterValueSchema);

export const BuildMetadataSchema = v.object({
  version: NonEmptyStringSchema,
  organization: NonEmptyStringSchema,
  date: NonEmptyStringSchema,
  abstract: NonEmptyStringSchema,
  references: v.optional(
    v.array(
      v.object({
        title: NonEmptyStringSchema,
        url: NonEmptyStringSchema,
      })
    )
  ),
});

export const PackageMetadataSchema = v.object({
  version: v.optional(NonEmptyStringSchema),
});

export type BuildMetadata = v.InferOutput<typeof BuildMetadataSchema>;
export type FrontmatterValue = v.InferOutput<typeof FrontmatterValueSchema>;
export type Frontmatter = v.InferOutput<typeof FrontmatterSchema>;
export type PackageMetadata = v.InferOutput<typeof PackageMetadataSchema>;

export function parseBuildMetadata(input: unknown): BuildMetadata {
  return v.parse(BuildMetadataSchema, input);
}

export function parseFrontmatter(input: unknown): Frontmatter {
  return v.parse(FrontmatterSchema, input);
}

export function parsePackageMetadata(input: unknown): PackageMetadata {
  return v.parse(PackageMetadataSchema, input);
}
