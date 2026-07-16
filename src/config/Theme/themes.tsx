import {type BrandVariants, webDarkTheme, webLightTheme} from '@fluentui/react-components';

const portfolioBrand: BrandVariants = {
    10: "#030402",
    20: "#171A11",
    30: "#242C1B",
    40: "#2C3922",
    50: "#34472A",
    60: "#3C5532",
    70: "#43633B",
    80: "#4A7245",
    90: "#508250",
    100: "#55915C",
    110: "#5AA268",
    120: "#5EB276",
    130: "#62C384",
    140: "#65D494",
    150: "#69E5A5",
    160: "#70F5B7"
};

export const portfolioLightTheme = {
    ...webLightTheme,

    colorBrandBackground: portfolioBrand[110],
    colorBrandBackgroundHover: portfolioBrand[90],
    colorBrandBackgroundPressed: portfolioBrand[50],
    colorBrandBackgroundSelected: portfolioBrand[90],

    colorCompoundBrandBackground: portfolioBrand[140],
    colorCompoundBrandBackgroundHover: portfolioBrand[90],
    colorCompoundBrandBackgroundPressed: portfolioBrand[50],

    colorCompoundBrandForeground1: portfolioBrand[110],
    colorCompoundBrandForeground1Hover: portfolioBrand[90],
    colorCompoundBrandForeground1Pressed: portfolioBrand[50],

    colorBrandForeground1: portfolioBrand[110],
    colorBrandForegroundLink: portfolioBrand[110],
    colorBrandForegroundLinkHover: portfolioBrand[90],
    colorBrandForegroundLinkPressed: portfolioBrand[50],

    colorNeutralForeground2BrandHover: portfolioBrand[110],
    colorNeutralForeground2BrandPressed: portfolioBrand[90],
    colorNeutralForeground2BrandSelected: portfolioBrand[110],

    colorNeutralForeground3BrandHover: portfolioBrand[110],
    colorNeutralForeground3BrandPressed: portfolioBrand[90],
    colorNeutralForeground3BrandSelected: portfolioBrand[110],

    colorBrandStroke1: portfolioBrand[110],
    colorCompoundBrandStroke: portfolioBrand[110],
    colorCompoundBrandStrokeHover: portfolioBrand[90],
    colorCompoundBrandStrokePressed: portfolioBrand[50],
};

export const portfolioDarkTheme = {
    ...webDarkTheme,

    colorBrandBackground: portfolioBrand[110],
    colorBrandBackgroundHover: portfolioBrand[140],
    colorBrandBackgroundPressed: portfolioBrand[110],
    colorBrandBackgroundSelected: portfolioBrand[140],

    colorCompoundBrandBackground: portfolioBrand[140],
    colorCompoundBrandBackgroundHover: portfolioBrand[90],
    colorCompoundBrandBackgroundPressed: portfolioBrand[50],

    colorCompoundBrandForeground1: portfolioBrand[140],
    colorCompoundBrandForeground1Hover: portfolioBrand[110],
    colorCompoundBrandForeground1Pressed: portfolioBrand[140],

    colorBrandForeground1: portfolioBrand[140],
    colorBrandForegroundLink: portfolioBrand[140],
    colorBrandForegroundLinkHover: portfolioBrand[110],
    colorBrandForegroundLinkPressed: portfolioBrand[140],

    colorNeutralForeground2BrandHover: portfolioBrand[140],
    colorNeutralForeground2BrandPressed: portfolioBrand[110],
    colorNeutralForeground2BrandSelected: portfolioBrand[140],

    colorNeutralForeground3BrandHover: portfolioBrand[140],
    colorNeutralForeground3BrandPressed: portfolioBrand[110],
    colorNeutralForeground3BrandSelected: portfolioBrand[140],

    colorBrandStroke1: portfolioBrand[110],
    colorCompoundBrandStroke: portfolioBrand[110],
    colorCompoundBrandStrokeHover: portfolioBrand[140],
    colorCompoundBrandStrokePressed: portfolioBrand[110],
};