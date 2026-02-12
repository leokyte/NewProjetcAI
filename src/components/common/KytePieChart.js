import React from 'react';
import { PieChart } from 'react-native-svg-charts';
import { G, Text as TextSvg } from 'react-native-svg';
import { currencyValueFormatter } from '../../util';

const KytePieChart = (props) => {
  let pieData = props.data.sort((a, b) => {
    return b - a;
  });
  const calcPercent = (value) => {
    const total = pieData.reduce((a, b) => a + b, 0);
    return (100 * value) / total;
  };

  pieData = pieData.map((value, index) => ({
    value: calcPercent(value),
    svg: { fill: props.colors[index] },
    key: `pie-${index}`,
  }));

  const Labels = ({ slices }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, data } = slice;
      if (data.value < 4) {
        return null;
      }
      return (
        <G key={index}>
          <TextSvg
            fill={data.svg.fill}
            stroke={data.svg.fill}
            fontSize={props.labels ? props.labels.fontSize || '12' : '12'}
            fontFamily={
              props.labels ? props.labels.fontFamily || 'Graphik-Extralight' : 'Graphik-Extralight'
            }
            letterSpacing={props.labels ? props.labels.letterSpacing || '1' : '1'}
            x={labelCentroid[0] * 1.05}
            y={labelCentroid[1] * 1.05}
            textAnchor={props.labels ? props.labels.textAnchor || 'middle' : 'middle'}
          >
            {`${currencyValueFormatter(data.value.toFixed(1), props.currency, true).replace(
              '.00',
              '',
            )}%`}
          </TextSvg>
        </G>
      );
    });
  };

  return (
    <PieChart
      style={props.style || { height: 250 }}
      data={pieData}
      innerRadius={props.innerRadius || 68}
      outerRadius={props.outerRadius || 80}
      labelRadius={props.labelRadius || 100}
      padAngle={props.padAngle || 0}
    >
      <Labels />
    </PieChart>
  );
};

export { KytePieChart };
