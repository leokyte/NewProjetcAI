import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

const CustomKeyboardAvoidingView = (props) => {
  const renderIos = () => {
    return (
      <KeyboardAvoidingView {...props} behavior={props.behavior || 'padding'}>
        {props.children}
      </KeyboardAvoidingView>
    );
  };

  const renderAndroid = () => {
    return <KeyboardAvoidingView {...props}>{props.children}</KeyboardAvoidingView>;
  };

  return Platform.OS === 'ios' ? renderIos() : renderAndroid();
};

export { CustomKeyboardAvoidingView };
