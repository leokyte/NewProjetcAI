import React from 'react';
import { Linking } from 'react-native';
import { BottomSlideModal } from '../../../common';
import I18n from '../../../../i18n/i18n';

const Strings = {
  TUTORIAL_BUTTON_LABEL: I18n.t('goToCompleteTutorial'),
  FBE_TUTORIAL_BUTTON_LABEL: I18n.t('fbe.goToCompleteTutorial'),
  GO_TO_INTEGRATION_BUTTON_LABEL: I18n.t('startIntegration'),
};

const SocialMediaIntegrationTip = ({
  isModalVisible,
  hideModal,
  title,
  subtitle,
  image,
  info,
  infoStyle,
  infoContainerStyle,
  tutorialUrl,
  goToIntegration,
  typeIntegration,
  isIntegrated,
  showTagPro,
  ...props
}) => {
  const clickHandler = (func) => {
    hideModal();
    func();
  };

  const openTutorialUrl = () => Linking.openURL(tutorialUrl);

  const buttons = [
    {
      text: typeIntegration ? Strings.FBE_TUTORIAL_BUTTON_LABEL : Strings.TUTORIAL_BUTTON_LABEL,
      cancel: true,
      onPress: () => clickHandler(openTutorialUrl),
    },
    {
      text: Strings.GO_TO_INTEGRATION_BUTTON_LABEL,
      nextArrow: !typeIntegration,
      onPress: () => clickHandler(goToIntegration),
    },
  ];

  const buttonHasFbeIntegration = [
    {
      text: typeIntegration ? Strings.FBE_TUTORIAL_BUTTON_LABEL : Strings.TUTORIAL_BUTTON_LABEL,
      cancel: true,
      onPress: () => clickHandler(openTutorialUrl),
    },
  ];

  return (
    <BottomSlideModal
      isModalVisible={isModalVisible}
      hideModal={hideModal}
      title={title}
      subtitle={subtitle}
      image={image}
      info={info}
      infoStyle={infoStyle}
      infoContainerStyle={infoContainerStyle}
      buttons={isIntegrated || showTagPro ? buttonHasFbeIntegration : buttons}
    />
  );
};

export default SocialMediaIntegrationTip;
