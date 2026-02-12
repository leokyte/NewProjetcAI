import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import { KyteSafeAreaView } from './KyteSafeAreaView';
import { colors, Type } from '../../styles';
import I18n from '../../i18n/i18n';

const mainBackgroundColor = 'rgba(54, 63, 77, 0.9)';

const LoadingCleanScreen = (props) => {
  const { textStyle } = styles;
  return (
    <KyteSafeAreaView style={styles.loadingContainer(props.lazy)}>
      <ActivityIndicator size='large' color={colors.actionColor} />
      <Text style={[Type.Medium, textStyle(props.lazy ? mainBackgroundColor : '#FFFFFF')]}>
        {props.text || I18n.t('words.s.loading')}
      </Text>
    </KyteSafeAreaView>
  );
};

const styles = {
  loadingContainer: (lazy) => {
    return {
      flexDirection: 'column',
      flex: 1,
      justifyContent: lazy ? 'flex-start' : 'center',
      backgroundColor:lazy ? 'white' : mainBackgroundColor,
      alignItems: 'center',
      position: 'absolute',
      top: lazy ? 50 : 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 21,
    };
  },
  textStyle: (color) => ({
    color,
    marginVertical: 15,
    marginHorizontal: 20,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 26,
  }),
};

export { LoadingCleanScreen };
