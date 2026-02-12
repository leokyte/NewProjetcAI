export const listStyles = {
  itemContainer: (paddingVertical, borderColor) => ({
    paddingVertical,
    borderBottomWidth: 1,
    borderColor,
    flexDirection: 'row',
  }),
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  cornerContainer: (width) => ({
    width,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  }),
  itemTitle: (color) => ({
    fontFamily: 'Graphik-Medium',
    fontSize: 16,
    lineHeight: 20,
    color
  }),
  itemInfo: (color) => ({
    fontFamily: 'Graphik-Regular',
    color
  }),
  textCenter: {
    textAlign: 'center'
  }
};
