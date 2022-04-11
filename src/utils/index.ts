import _ from 'lodash';
import dayjs from 'dayjs';
import { parseDocument } from 'htmlparser2';
import { DataNode, Element } from 'domhandler';
import { ElementType } from 'domelementtype';
import { DEFAULT_FONT_SIZE, D_TagStyleMap } from '../constants';
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  convertMillimetersToTwip,
  Footer,
  AlignmentType,
  IRunOptions,
  IParagraphOptions,
  ExternalHyperlink,
  UnderlineType,
  convertInchesToTwip,
  LevelFormat,
  ImageRun,
  Media,
} from 'docx';
import { saveAs } from 'file-saver';

type IHtmlTag = keyof typeof D_TagStyleMap;

// 生成属性
export const genAttrs = (
  attribs: { [name: string]: string },
  attrs: { [name: string]: string }[],
) => {
  const omitAttr = _.omit(attribs, ['style']);
  !_.isEmpty(omitAttr) && attrs.push(omitAttr);
  return attrs;
};

// 生成样式
export const genStyles = (
  attribs: { [name: string]: string },
  node: any,
  styles: string[],
) => {
  D_TagStyleMap[node.parent.name as IHtmlTag] &&
    styles.push(D_TagStyleMap[node.parent.name as IHtmlTag]);
  attribs?.style && styles.push(attribs?.style);
  return styles;
};

// 文本格式化
export const buildText = (
  child: DataNode & Element,
  result: { elements: any[] },
) => {
  const elementInfo = {
    type: ElementType.Text,
    text: child.data,
    attrs: genAttrs(child.attribs, []),
    styles: genStyles(child.attribs, child, []),
    ..._.pick(child, ['name']),
  };

  let _child = child as any;
  while (_child.parent && _child.parent.type !== ElementType.Root) {
    genAttrs(_child.parent?.attribs, elementInfo.attrs);
    genStyles(_child.parent?.attribs, _child, elementInfo.styles);
    _child = _child.parent;
  }
  result.elements.push(elementInfo);
};

// a标签格式化
export const buildATag = (
  child: DataNode & Element,
  result: { elements: any[] },
) => {
  const elementInfo = {
    type: ElementType.Text,
    // @ts-ignore
    text: child.children[0]?.data,
    attrs: genAttrs(child.attribs, []),
    styles: genStyles(child.attribs, child, []),
    href: child.attribs?.href,
    title: child.attribs?.title,
    ..._.pick(child, ['name']),
  };

  let _child = child as any;
  while (_child.parent && _child.parent.type !== ElementType.Root) {
    genAttrs(_child.parent?.attribs, elementInfo.attrs);
    genStyles(_child.parent?.attribs, _child, elementInfo.styles);
    _child = _child.parent;
  }
  result.elements.push(elementInfo);
};

export const buildImage = (
  child: DataNode & Element,
  result: { elements: any[] },
) => {
  const elementInfo = {
    type: ElementType.Tag,
    // @ts-ignore
    text: child.children[0]?.data,
    attrs: genAttrs(child.attribs, []),
    styles: genStyles(child.attribs, child, []),
    ..._.pick(child, ['name']),
  };

  let _child = child as any;
  while (_child.parent && _child.parent.type !== ElementType.Root) {
    genAttrs(_child.parent?.attribs, elementInfo.attrs);
    genStyles(_child.parent?.attribs, _child, elementInfo.styles);
    _child = _child.parent;
  }
  result.elements.push(elementInfo);
};

// 递归所有node节点，找到text、a、image、table标签
const walk = (child: DataNode & Element, result: { elements: any[] }) => {
  if (child.name === 'a') {
    // a标签
    buildATag(child, result);
  } else if (child.name === 'img') {
    // image标签
    buildImage(child, result);
  } else if (child.type === ElementType.Text) {
    // 文本类型
    buildText(child, result);
  }

  // 递归
  if (
    child.children &&
    child.children.length &&
    !['a', 'img'].includes(child.name)
  ) {
    Array.from(child.children).forEach((i: any) => {
      walk(i, result);
    });
  }
};

// styles数组转对象
export const array2Style = (styles: string[]) => {
  const info: Record<string, string> = {};
  styles.forEach((c) => {
    // 转数组 "font-weight: bold; font-size: 36px; line-height: 1.5;".split(';')
    const splitArr = c.split(';').filter(Boolean);
    splitArr.forEach((_c) => {
      const [key, value] = _c.split(':');
      info[key.trim()] = value.replace(';', '').trim();
    });
  });

  return info;
};

// array2Attr
export const array2Attr = (attrs: string[]): any => {
  return attrs.reduce((a, b) => Object.assign(a, b), {});
};

// style转格式 例如text-align、padding-left
export const arr2ParagraphOptions = (elements: any): IParagraphOptions => {
  const styles: any[] =
    elements.map((el: { styles: string[] }) => array2Style(el.styles)) ?? [];
  const styleInfo = styles.reduce((a, b) => Object.assign(a, b), {});

  return {
    // 文字对齐方式
    alignment: styleInfo['text-align'] ? styleInfo['text-align'] : [],
    // 段落间距
    indent: {
      left: styleInfo['padding-left']
        ? convertMillimetersToTwip(parseInt(styleInfo['padding-left']) / 10)
        : 0,
      right: styleInfo['padding-right']
        ? convertMillimetersToTwip(parseInt(styleInfo['padding-right']) / 10)
        : 0,
    },
    // readonly thematicBreak?: boolean;
    // readonly contextualSpacing?: boolean;
    // readonly rightTabStop?: number;
    // readonly leftTabStop?: number;
    // readonly spacing?: ISpacingProperties;
    // readonly keepNext?: boolean;
    // readonly keepLines?: boolean;
    // readonly outlineLevel?: number;
    // readonly border?: IBordersOptions;
    // readonly heading?: HeadingLevel;
    // readonly bidirectional?: boolean;
    // readonly pageBreakBefore?: boolean;
    // readonly tabStops?: {
    //     readonly position: number | TabStopPosition;
    //     readonly type: TabStopType;
    //     readonly leader?: LeaderType;
    // }[];
    // readonly style?: string;
    // readonly bullet?: {
    //     readonly level: number;
    // };
    // readonly shading?: IShadingAttributesProperties;
    // readonly widowControl?: boolean;
    // readonly frame?: IFrameOptions;
    // readonly suppressLineNumbers?: boolean;
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const genDocxStyle = (info: Record<string, string>): IRunOptions => {
  const [r, g, b] =
    info['color'] && info['color'].includes('rgba')
      ? info['color'].replace(/rgba\((.*)\)/, '$1').split(',')
      : [];
  return {
    bold: info['font-weight'] === 'bold',
    italics: info['font-style'] === 'italic',
    color:
      info['color'] && info['color'].includes('rgba')
        ? rgbToHex(Number(r), Number(g), Number(b))
        : info['color'],
    size: info['font-size'] ? parseInt(info['font-size']) : DEFAULT_FONT_SIZE,
    shading: {
      fill: info['background-color'],
    },
    // 下标
    subScript: !!info['subscript'],
    // 上标
    superScript: !!info['superscript'],
    // 下划线
    underline:
      info['text-decoration'] === 'underline'
        ? {
            color: info['color'],
            type: UnderlineType.SINGLE,
          }
        : undefined,
    strike: info['text-decoration'] === 'line-through',
    //  italicsComplexScript: boolean;
    //  underline: {
    //      color: string;
    //      type: UnderlineType;
    //   };
    //  emphasisMark: {
    //      type: EmphasisMarkType;
    //   };
    //  sizeComplexScript: boolean | number | string;
    //  rightToLeft: boolean;
    //  smallCaps: boolean;
    //  allCaps: boolean;
    //  strike: boolean;
    //  doubleStrike: boolean;
    //  subScript: boolean;
    //  superScript: boolean;
    //  font: string | IFontOptions | IFontAttributesProperties;
    //  highlight: string;
    //  highlightComplexScript: boolean | string;
    //  characterSpacing: number;
    //  shading: IShadingAttributesProperties;
    //  emboss: boolean;
    //  imprint: boolean;
    //  revision: IRunPropertiesChangeOptions;
  };
};

// 解析html
/**
 *
 * @param html html字符串
 * @param name 下载的文件名
 */
export const genDocument = (
  html: string,
  urlInfo: Record<string, ArrayBuffer>,
  name = dayjs().format('YYYYMMDDHHmmss'),
) => {
  const ast = parseDocument(html);
  const { children } = ast;
  const childrenResult = _.cloneDeep(children).map((c) => {
    return {
      elements: [],
    };
  });

  children.forEach((child, index) => {
    walk(child as unknown as DataNode & Element, childrenResult[index]);
  });

  const margin = {
    top: convertMillimetersToTwip(25.4),
    left: convertMillimetersToTwip(31.8),
    right: convertMillimetersToTwip(31.8),
    bottom: convertMillimetersToTwip(25.4),
  };

  const doc = new Document({
    numbering: {
      config: [
        {
          levels: [
            {
              level: 0,
              format: LevelFormat.UPPER_ROMAN,
              text: '%1',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.18),
                  },
                },
              },
            },
          ],
          reference: 'my-crazy-reference',
        },
        {
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.18),
                  },
                },
              },
            },
          ],
          reference: 'my-number-numbering-reference',
        },
        {
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL_ZERO,
              text: '[%1]',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.18),
                  },
                },
              },
            },
          ],
          reference: 'padded-numbering-reference',
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin,
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                text: '1',
                style: 'normalPara',
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        children: childrenResult.map((child, index) => {
          return new Paragraph({
            // 有序列表
            // numbering: {
            //   reference: 'my-number-numbering-reference',
            //   level: 0,
            // },
            // 无序列表
            // bullet: {
            //   level: 0
            // },
            ...arr2ParagraphOptions(child.elements),
            children: child.elements.map((element: any) => {
              const { styles = [], name, attrs } = element;
              const styleObj = array2Style(styles);
              const attrObj = array2Attr(attrs);
              if (name === 'a') {
                return new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text:
                        (element.title as unknown as string) ?? element.text,
                      style: 'Hyperlink',
                    }),
                  ],
                  link: element.href,
                });
              } else if (name === 'img') {
                return new ImageRun({
                  data: urlInfo[attrObj['src']],
                  transformation: {
                    width: Number(attrObj.width),
                    height: Number(attrObj.height),
                  },
                });
              } else {
                return new TextRun({
                  text: element.text as unknown as string,
                  ...genDocxStyle(styleObj),
                });
              }
            }),
          });
        }),
      },
    ],
  });
  // 导出文件
  Packer.toBlob(doc).then((blob) => {
    console.log(blob);
    saveAs(blob, `${name}.docx`);
    console.log('Document created successfully');
  });
};
