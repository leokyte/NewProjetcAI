import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../styles';

const KyteTableHeader = (props) => {
  const { tableHeader } = tableStyles;
  return <View style={tableHeader}>{props.children}</View>;
};

const KyteTableRow = (props) => {
  const { tableRow, rowBest, rowWorst } = tableStyles;
  const isBest = props.status === 'best';
  const isWorst = props.status === 'worst';
  return (
    <View style={[tableRow, isBest ? rowBest : null, isWorst ? rowWorst : null, props.style]}>
      {props.children}
    </View>
  );
};

const KyteTh = (props) => {
  const { thContainer, thStyles, thBold } = tableStyles;
  const isBold = props.status === 'bold';
  return (
    <View style={[thContainer(props.width, props.colspan), props.style]}>
      <Text style={[thStyles, isBold ? thBold : null]}>{props.children.toUpperCase()}</Text>
    </View>
  );
};

const KyteTd = (props) => {
  const { tdContainer, tdStyles, tdBest, tdWorst, tdBold, infoCircleTd } = tableStyles;
  const isBest = props.status === 'best';
  const isWorst = props.status === 'worst';
  const isBold = props.status === 'bold';
  const renderChildren = (children) => {
    if (typeof children === 'number' || typeof children === 'string')
      return <Text style={[tdStyles, isBest ? tdBest : null, isWorst ? tdWorst : null, isBold ? tdBold : null]} ellipsizeMode='tail' numberOfLines={props.numberOfLines || 1}>{props.children}</Text>;
    return children;
  };
  return (
    <View style={[tdContainer(props.width), props.style, props.colorCircle ? { flexDirection: 'row' } : null]}>
      {props.colorCircle ? <View style={infoCircleTd(props.colorCircle, 12)} /> : null}
      {renderChildren(props.children)}
    </View>
  );
};

const KyteTableInfo = (props) => {
  const { tableInfo, infoCircle, infoText } = tableStyles;
  return (
    <View style={tableInfo}>
      <View style={[infoCircle(props.color, 10), { paddingTop: 5 }]} />
      <Text style={infoText(props.color)}>{props.children}</Text>
    </View>
  );
};

const tdSpacing = 15;
const calcColspan = (colspan) => {
  return tdSpacing * (colspan > 1 ? colspan + 1 : colspan);
};
const tableStyles = {
  tableHeader: {
    height: 55,
    alignItems: 'center',
    backgroundColor: colors.lightBg,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: colors.borderDarker,
  },
  thStyles: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryGrey,
    fontSize: 12,
  },
  thBold: {
    color: colors.primaryColor,
  },
  tdStyles: {
    fontFamily: 'Graphik-Regular',
    color: colors.primaryColor,
    fontSize: 12,
  },
  tdBest: {
    fontFamily: 'Graphik-Medium',
    color: colors.actionColor,
  },
  tdWorst: {
    fontFamily: 'Graphik-Medium',
    color: colors.worstColor,
  },
  tdBold: {
    fontFamily: 'Graphik-Medium',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    flexDirection: 'row',
  },
  rowBest: {
    backgroundColor: 'rgba(46, 209, 172, 0.1)',
  },
  rowWorst: {
    backgroundColor: colors.worstColor,
  },
  thContainer: (width, colspan = 1) => ({
    flex: width || 1,
    paddingVertical: tdSpacing,
    paddingLeft: tdSpacing,
    paddingRight: calcColspan(colspan),
  }),
  tdContainer: (width) => ({
    flex: width || 1,
    paddingVertical: 12,
    paddingHorizontal: tdSpacing,
    backgroundColor: '#FFF',
  }),
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tdSpacing,
  },
  infoCircle: (backgroundColor, size) => ({
    backgroundColor,
    borderRadius: size,
    width: size,
    height: size,
    marginRight: tdSpacing,
    position: 'relative',
    top: 1.5,
  }),
  infoCircleTd: (backgroundColor, size) => ({
    backgroundColor,
    borderRadius: size,
    width: size,
    height: size,
    marginRight: 10,
    marginTop: 5,
  }),
  infoText: (color) => ({
    color,
    fontFamily: 'Graphik-Medium',
    fontSize: 12,
  }),
};

export { KyteTableHeader, KyteTableRow, KyteTableInfo, KyteTh, KyteTd };
