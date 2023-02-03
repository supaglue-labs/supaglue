import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: Colors;
    // TODO: Type this properly
    componentOverrides?: Record<string, any>;
  }

  export type Colors = {
    background: string;
    inputBackground: string;
    text: string;
    textSecondary: string;
    inputText: string;
    disabled: string;
    textOnPrimaryBackground: string;
    primary: ColorPalette;
  };

  export type ColorPalette = {
    lighter?: string;
    light?: string;
    base: string;
    dark?: string;
    darker?: string;
  };
}
