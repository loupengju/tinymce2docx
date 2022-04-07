export const DEFAULT_LINE_HEIGHT = 1.5;
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_H6_FONT_SIZE = 16;
export const DEFAULT_H5_FONT_SIZE = 20;
export const DEFAULT_H4_FONT_SIZE = 26;
export const DEFAULT_H3_FONT_SIZE = 32;
export const DEFAULT_H2_FONT_SIZE = 36;
export const DEFAULT_H1_FONT_SIZE = 40;

// @refer https://github.com/byoungd/editor-to-word
// style with tag
export const D_TagStyleMap = {
  p: `line-height: ${DEFAULT_LINE_HEIGHT};`,
  strong: 'font-weight: bold;',
  em: 'font-style: italic;',
  u: 'text-decoration: underline;',
  del: 'text-decoration: line-through;',
  h1: `font-weight: bold; font-size: ${DEFAULT_H1_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  h2: `font-weight: bold; font-size: ${DEFAULT_H2_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  h3: `font-weight: bold; font-size: ${DEFAULT_H3_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  h4: `font-weight: bold; font-size: ${DEFAULT_H4_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  h5: `font-weight: bold; font-size: ${DEFAULT_H5_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  h6: `font-weight: bold; font-size: ${DEFAULT_H6_FONT_SIZE}px; line-height: ${DEFAULT_LINE_HEIGHT};`,
  sub: 'subscript: true;',
  sup: 'superscript: true;',
  a: `text-decoration: underline; color: #58A6FF;`,
};