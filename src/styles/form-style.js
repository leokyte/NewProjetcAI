import { Platform } from 'react-native';
import { colors } from './colors';

const formStyle = {
  fieldSet: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  fieldsContainer: {
    padding: 15,
  },
  lightInput: {
    color: '#FFF',
  },
  inputLg: {
    fontSize: 36,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: 'Graphik-Semibold',
  },
  inputMd: {
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Graphik-Light',
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 15,
    color: colors.primaryDarker,
  },
  inputStyle: {
    color: colors.primaryDarker,
    padding: 5,
    fontSize: 16,
    fontFamily: 'Graphik-Regular',
  },
  inputContainerStyle: {
    flexDirection: 'column',
  },
  errorStyle: {
    fontFamily: 'Graphik-Regular',
    color: colors.errorColor,
    fontSize: 12,
    paddingHorizontal: 5,
  },
  inputGroup: {
    flexDirection: 'row',
  },
  inputHolder: (height) => ({
    height,
    flexDirection: 'row',
    alignItems: 'center',
  }),
  inputLabel: {
    fontFamily: 'Graphik-Semibold',
    color: colors.grayBlue,
    fontSize: 12,
    paddingHorizontal: 5,
    ...Platform.select({
      ios: { height: 25, paddingTop: 13 },
      android: { height: 18, marginTop: 15 },
    }),
  },
  labelContainer: {
    height: 13,
    justifyContent: 'center',
  },
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  checkboxText: {
    fontFamily: 'Graphik-Regular',
    color: colors.primaryColor,
    fontWeight: 'normal',
  },
  checkList: {
    padding: 20,
    flexDirection: 'column',
  },
  checkListTitle: {
    fontFamily: 'Graphik-Medium',
    fontSize: 16,
    color: colors.primaryColor,
    marginBottom: 15,
  },
  checkLisContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkListItem: {
    flexDirection: 'row',
    width: '50%',
  },
};

export { formStyle };
