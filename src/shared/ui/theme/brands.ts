/**
 * Brand palettes. A white-label build changes `ACTIVE_BRAND` (or adds a brand) and nothing else:
 * every component reads semantic roles from the theme, never these hex values directly.
 */
export type BrandPalette = {
  /** Main action color, used for buttons, links and focus. */
  primary: string;
  primaryPressed: string;
  /** Text and icons on top of `primary`. */
  onPrimary: string;
  /** Primary as seen on a dark background (usually lighter). */
  primaryDark: string;
  primaryDarkPressed: string;
  onPrimaryDark: string;
};

export const BRANDS = {
  default: {
    primary: '#0A6C96',
    primaryPressed: '#085A7D',
    onPrimary: '#FFFFFF',
    primaryDark: '#55B6E0',
    primaryDarkPressed: '#7AC7E8',
    onPrimaryDark: '#06202D',
  },
  ember: {
    primary: '#B4441E',
    primaryPressed: '#963817',
    onPrimary: '#FFFFFF',
    primaryDark: '#F08A62',
    primaryDarkPressed: '#F4A483',
    onPrimaryDark: '#2A0E04',
  },
} satisfies Record<string, BrandPalette>;

export type BrandName = keyof typeof BRANDS;

export const ACTIVE_BRAND: BrandName = 'default';
