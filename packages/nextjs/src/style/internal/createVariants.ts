import { SgTheme } from '../types/theme';
import { ApplyVariants, CreateVariantsConfig, DefaultVariants, StyleRule, Variants } from '../types/variant';

interface CreateVariants {
  <P extends Record<string, any>, V extends Variants = Variants>(
    configFn: (theme: SgTheme, variantParams: P) => CreateVariantsConfig<V>
  ): ApplyVariants<V>;
}

const applyVariantRules = (computedStyles: StyleRule, variantsToApply: Record<string, string>, variants: Variants) => {
  for (const [key, value] of Object.entries(variantsToApply)) {
    fastDeepMergeAndReplace(variants[key][value], computedStyles);
  }
};

const applyElementOverrides = (computedStyles: StyleRule, elementOverrides?: Record<string, any>) => {
  fastDeepMergeAndReplace(elementOverrides, computedStyles);
};

export const _createVariants: CreateVariants = (configFn) => {
  return (variantParams: any) => (theme: any) => {
    const { base, variants = {}, defaultVariants = {}, elementOverrides } = configFn(theme, variantParams);
    const variantsToApply = calculateVariantsToBeApplied({
      variants,
      variantParams,
      defaultVariants,
    });
    const computedStyles: StyleRule = {
      ...base,
    };
    applyVariantRules(computedStyles, variantsToApply, variants);
    applyElementOverrides(computedStyles, elementOverrides);
    return computedStyles;
  };
};

const calculateVariantsToBeApplied = ({
  variants,
  variantParams,
  defaultVariants,
}: {
  variants: Variants;
  variantParams?: Record<string, any>;
  defaultVariants: DefaultVariants;
}) => {
  const variantsToApply: Record<string, string> = {};
  for (const key in variants) {
    if (variantParams && key in variantParams) {
      variantsToApply[key] = variantParams[key];
    } else if (key in defaultVariants) {
      variantsToApply[key] = defaultVariants[key];
    }
  }
  return variantsToApply;
};

/**
 * Merges `source` into `target` without creating new object references
 * The merged props will appear on the `target` object
 * If `target` already has a value for a given key it will not be overwritten
 */
export const fastDeepMergeAndReplace = (
  source: Record<any, any> | undefined | null,
  target: Record<any, any> | undefined | null
) => {
  if (!source || !target) {
    return;
  }

  for (const key in source) {
    if (source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === undefined) {
        target[key] = new (Object.getPrototypeOf(source[key]).constructor)();
      }
      fastDeepMergeAndReplace(source[key], target[key]);
    } else {
      target[key] = source[key];
    }
  }
};
