import { colors } from './';

const buttonStyles = {
  base: (hasSubtitle) => ({
    height: hasSubtitle ? 65 : 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 6,
    marginHorizontal: 10,
    paddingHorizontal: 15,
  }),
  small: {
    height: 36,
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  active: {
    backgroundColor: colors.actionColor,
  },
  disabled: {
    backgroundColor: '#EEEEEE',
    borderColor: colors.actionColor,
  },
  cancel: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: colors.lightColor,
  },
  showDisabled: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: colors.lightBorder,
  },
};

export { buttonStyles };
