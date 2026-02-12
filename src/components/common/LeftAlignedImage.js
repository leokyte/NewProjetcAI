import React, { Component } from 'react';
import { StyleSheet, Image, View, Dimensions } from 'react-native';

import { calcDim } from '../../util';

export default class LeftAlignedImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
      width: 0,
      imageWidth: 0,
      imageHeight: 0,
      source: null,
    };
  }

  UNSAFE_componentWillMount() {
    this._updateState(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this._updateState(nextProps);
  }

  _updateState(props) {
    const { source, height } = props;
    const width = props.width || Dimensions.get('window').width;

    Image.getSize(source.uri, (iw, ih) => {
      const { imageWidth, imageHeight } = calcDim(iw, ih, height, width);

      this.setState({
        imageWidth,
        imageHeight,
        source,
        height,
        width,
      });
    });
  }

  render() {
    const { source, height, width, imageWidth, imageHeight } = this.state;

    const localStyle = height ? { height, width } : {};

    return (
      <View style={[styles.container, localStyle]}>
        {source ?
          <Image
            style={{ width: imageWidth, height: imageHeight }}
            resizeMode="contain"
            source={source}
          />
        :
        null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
