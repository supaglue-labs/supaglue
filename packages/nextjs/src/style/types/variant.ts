import { Interpolation, Theme } from '@emotion/react';
import { SgTheme } from './theme';

type UnwrapBooleanVariant<T> = T extends 'true' | 'false' ? boolean : T;

export type StyleRule = Exclude<Interpolation<Theme>, string | number | boolean>;

type VariantDefinition = Record<string, StyleRule>;

export type Variants = Record<string, VariantDefinition>;

type VariantNameToKeyMap<V> = {
  [key in keyof V]?: UnwrapBooleanVariant<keyof V[key]>;
};

export type DefaultVariants = Record<string, string>;

export type CreateVariantsConfig<V> = {
  base?: StyleRule;
  variants: V;
  defaultVariants?: DefaultVariants;
  elementOverrides?: Record<string, any>;
};

export type ApplyVariants<V> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (variantParams?: VariantNameToKeyMap<V>): (theme: any) => StyleRule;
};

export interface CreateVariants {
  <P extends Record<string, any>, V extends Variants = Variants>(
    configFn: (theme: SgTheme, variantParams: P) => CreateVariantsConfig<V>
  ): ApplyVariants<V>;
}
