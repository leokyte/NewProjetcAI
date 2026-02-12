import tinycolor from 'tinycolor2'
import { colorGrid } from '../styles';
import { CatalogColorType } from '../enums';

export const WHITE = "#ffffff";
export const BLACK = "#020617";

export const TypeColor = {
	ULTRADARK: 'ultraDark',
	DARK: 'dark',
	PRIMARY: 'primary',
	LIGHT: 'light',
	ULTRALIGHT: 'ultraLight',
}

export const colorLuminance = ({ calculateColor, l }) => {
  const lumi = l * 100;

  const result = {
    ultraLight: "",
    light: "",
    primary: "",
    dark: "",
    ultraDark: "",
  };

  const lumiVal = {
    none: 0,
    low: 16,
    mediumLow: 32,
    mediumHigh: 48,
    high: 64,
  };

  if (lumi !== 0) {
    const luminanceTarget = {
      16: {
        ultraLight: lumiVal.high,
        light: lumiVal.mediumHigh,
        primary: lumiVal.mediumLow,
        dark: lumiVal.low,
        ultraDark: lumiVal.none,
      },
      33: {
        ultraLight: lumiVal.mediumHigh,
        light: lumiVal.mediumLow,
        primary: lumiVal.low,
        dark: lumiVal.none,
        ultraDark: -lumiVal.low,
      },
      67: {
        ultraLight: lumiVal.mediumLow,
        light: lumiVal.low,
        primary: lumiVal.none,
        dark: -lumiVal.low,
        ultraDark: -lumiVal.mediumLow,
      },
      83: {
        ultraLight: lumiVal.low,
        light: lumiVal.none,
        primary: -lumiVal.low,
        dark: -lumiVal.mediumLow,
        ultraDark: -lumiVal.mediumHigh,
      },
      100: {
        ultraLight: lumiVal.none,
        light: -lumiVal.low,
        primary: -lumiVal.mediumLow,
        dark: -lumiVal.mediumHigh,
        ultraDark: -lumiVal.high,
      },
    };

    for (const [threshold, values] of Object.entries(luminanceTarget)) {
      if (lumi <= parseInt(threshold, 10)) {
        return calculateColor(values, lumi, result);
      }
    }
  }

  // black
  return {
    primary: "#0A0A0A",
    light: "#292929",
    ultraLight: "#525252",
    dark: "#292929",
    ultraDark: "#040000",
  };
};

export const getThemeStore = (store) => {
  const { catalog } = store || {};
  const { version, themeColor } = catalog || {};

  if (!isBetaCatalog(version) || !themeColor) {
    return catalog?.color || "default";
  }

  const validThemes = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
  ];

  return isHexString(themeColor)
    ? "custom"
    : validThemes.includes(themeColor)
    ? (themeColor)
    : "default";
};

export const useCalcColor = (colorSelected) => {
	const calculateColor = (
		value,
		lumi,
		result,
		hsl
	) => {
		Object.keys(value).forEach((item) => {
			if (!result[item]) {
				result[item] = tinycolor(hsl).toString()
			}

			result[item] = tinycolor({
				h: hsl.h,
				s: hsl.s,
				l: lumi + value[item] < 1 ? 0.1 : lumi + value[item],
				a: hsl.a,
			}).toHexString()
		})

		return result
	}

	const hsl = tinycolor(colorSelected).toHsl()
	const { ultraLight, light, primary, dark, ultraDark } = colorLuminance({
		calculateColor: (value, lumi, result) =>
			calculateColor(value, lumi, result, hsl),
		l: hsl.l,
	})

	return {
		ultraLight,
		light,
		primary,
		dark,
		ultraDark,
		secondary: BLACK,
		tertiary: WHITE,
	}
};

export const isHexString = (value) =>
    Boolean(value && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value));

export const getForegroundOrNumberColor = (catalog, isBetaActive, foregroundOrNumber = CatalogColorType.FOREGROUND) => {
  const color = catalog?.color || 0;
  const themeColor = catalog?.themeColor || color;
  const betaColorHex = isHexString(themeColor) ? themeColor : colorGrid[themeColor].foreground;

  if(foregroundOrNumber === CatalogColorType.NUMBER) {
    const colorToGet = isBetaActive ? betaColorHex : colorGrid[color].foreground;
    return colorGrid.findIndex((color) => color.foreground === colorToGet)
  }
  return isBetaActive ? betaColorHex : colorGrid[color].foreground;
}

export const getInitialColor = (catalog, isBetaActive, isFree) => {
  if (isFree) {
    if(catalog?.color) return colorGrid[catalog.color].foreground
      
    return colorGrid[0].foreground;
  }

	if(catalog?.color || catalog?.themeColor) {
    return getForegroundOrNumberColor(catalog, isBetaActive)
  }
  return colorGrid[0].foreground; // 0 is used for new catalogs
}

export const isColorDefault = (initialColor) => !!colorGrid.find((color) => color.foreground === initialColor)

export const isColorCloseToWhite = (color) => {
  const luminance = tinycolor(color).getLuminance();
  
  // Define a threshold to decide if the color is close to white
  const threshold = 0.9;
  
  return luminance > threshold;
};
