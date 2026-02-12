import React from 'react';
import { View, Alert } from 'react-native';
import I18n from '../../../i18n/i18n';

const Strings = {
  TITLE: I18n.t('unsavedChangesTitle'),
  DESCRIPTION: I18n.t('unsavedChangesDescription'),
  DISCARD: I18n.t('alertDiscard'),
  SAVE: I18n.t('alertSave'),
};

const UnsaveChangesAlert = (props) => {
  const { discardAction, saveAction, saveText } = props;

  return (
    <View>
      {Alert.alert(Strings.TITLE, Strings.DESCRIPTION, [
        {
          text: Strings.DISCARD,
          onPress: discardAction,
        },
        {
          text: saveText || Strings.SAVE,
          onPress: saveAction,
        },
      ])}
    </View>
  );
};

export default UnsaveChangesAlert;
