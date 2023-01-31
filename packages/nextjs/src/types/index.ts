export type SupaglueAppearance = {
  theme?: 'light';
  layout?: {
    logoPlacement: 'inside' | 'outside' | 'none';
    logoImageUrl: string;
  };
  variables?: {
    colorPrimary?: string;
    colorDanger?: string;
    colorSuccess?: string;
    colorTextOnPrimaryBackground?: string;
    colorTextSecondary?: string;
    colorBackground?: string;
    colorInputText?: string;
    colorInputBackground?: string;
    fontFamily?: string;
    fontFamilyButtons?: string;
    fontSize?: string;
    fontSmoothing?: string;
    fontWeight?: string;
    borderRadius?: string;
    spacingUnit?: string;
  };
  elements?: object;
};

export const SUPAGLUE_PREFIX = 'sg-';
export const FORM_BUTTON_PRIMARY = 'formButtonPrimary';
export const FORM_BUTTON = 'button';
