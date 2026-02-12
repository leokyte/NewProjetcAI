import { colors } from './';

// Helper Steps Default Colors

export const stepStyle = (boxBackground, boxBorder, contentText, icon, btnBackground, btnBorder, btnText) => {
  const style = {
    boxBackground,
    boxBorder,
    contentText,
    icon,
    btnBackground,
    btnBorder,
    btnText,
  };

  return JSON.stringify(style);
};

const completedStep = stepStyle(
  '#fff',
  colors.actionColor,
  colors.actionColor,
  colors.actionColor,
  'transparent',
  'transparent',
  colors.grayBlue
);

const highlightedStep = stepStyle(
  '#fff',
  colors.disabledIcon,
  colors.primaryBg,
  colors.primaryBg,
  colors.actionColor,
  'transparent',
  '#fff',
);

const disabledStep = stepStyle(
  '#fff',
  colors.borderlight,
  colors.grayBlue,
  colors.grayBlue,
  '#fff',
  colors.disabledIcon,
  colors.grayBlue,
);

const activeStep = stepStyle(
  '#fff',
  colors.disabledIcon,
  colors.primaryBg,
  colors.primaryBg,
  'transparent',
  colors.actionColor,
  colors.actionColor,
);

export { completedStep, highlightedStep, disabledStep, activeStep };
