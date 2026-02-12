import React from 'react';
import { Linking } from 'react-native';
import { BottomSlideModal } from '../../../common';
import I18n from '../../../../i18n/i18n';

const Strings = {
  TITLE: I18n.t('linkSuccessCopiedLabel'),
  INFO: I18n.t('socialMediaCopyLinkModalInstructions'),
  GO_BACK_BUTTON_LABEL: I18n.t('goBackToConfigLabel'),
  GO_TO_LABEL: I18n.t('socialMediaCopyLinkModalInstructionsGoTo'),
};

const SuccessCopiedLinkModal = (props) => {
  const {
    partnerLink,
    partnerName,
    partnerInfoName,
  } = props;

  //
  // AUX methods
  //
  const backToConfig = () => {
    return props.navigation.goBack();
  };

  const goToPartner = () => Linking.openURL(partnerLink);

  //
  // PROPS generate
  //

  const info = [
    { text: Strings.INFO.text1 },
    { text: Strings.INFO.text2, bold: true },
    { text: `${Strings.INFO.text3}${partnerInfoName}.`},
  ];

  const buttons = [{
    text: Strings.GO_BACK_BUTTON_LABEL,
    cancel: true,
    onPress: backToConfig,
  },{
    text: `${Strings.GO_TO_LABEL} ${partnerName}`,
    onPress: goToPartner,
  }];

  // RETURN
  return (
    <BottomSlideModal
      { ...props }
      title={Strings.TITLE}
      info={info}
      buttons={buttons}
    />
  );
};

export default SuccessCopiedLinkModal;
