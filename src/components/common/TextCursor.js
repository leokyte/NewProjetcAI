import React, { Component } from 'react';
import * as Animatable from 'react-native-animatable';

class TextCursor extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    return (
      <Animatable.Text
        animation="fadeOut" easing="ease-out" iterationCount="infinite"
        style={props.cursorStyle}
      >
        {props.cursorSymbol || '|'}
      </Animatable.Text>
    );
  }
}

export { TextCursor };
