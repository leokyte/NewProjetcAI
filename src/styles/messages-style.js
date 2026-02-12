import { colors } from './colors';

const msg = {
  messageOuter: {
    position: 'relative',
  },
  messageContainer: (spacing = 20, paddingBottom = 120) => ({
    paddingTop: spacing,
    paddingHorizontal: spacing,
    paddingBottom,
    alignItems: 'center',
  }),
  messageImageContainer: (height = 110) => ({
    width: '100%',
    height,
  }),
  messageHeader: {
    backgroundColor: colors.actionColor,
    height: 120,
    alignItems: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  messageCta: {
    backgroundColor: colors.lightBg,
    padding: 15,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
  messageCtaInfo: {
    textAlign: 'center',
    color: colors.grayBlue,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  ctaBottom: {
    flexDirection: 'row',
    flex: 1,
  },
  ctaButtonContainer: {
    flex: 1,
  },
  messageImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  messageClose: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Graphik-Medium',
    fontSize: 22,
    color: colors.primaryColor,
    marginBottom: 20,
    lineHeight: 32,
  },
  content: {
    textAlign: 'center',
    fontFamily: 'Graphik-Regular',
    fontSize: 17,
    color: colors.primaryColor,
    marginBottom: 20,
    lineHeight: 32,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureText: {
    fontFamily: 'Graphik-Regular',
    fontSize: 16,
    color: colors.primaryColor,
  },
  highlightText: {
    fontFamily: 'Graphik-Medium',
  },
};

export { msg };
