import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import { DetailPage, CenterContent, ActionButton, KyteIcon, KyteText } from '../../../common';
import SuccessCopiedLinkModal from './SuccessCopiedLinkModal';
import I18n from '../../../../i18n/i18n';

import { generateFeedUrl } from '../../../../util';
import { renderTip } from '../utils/renderTip';

import { colors } from '../../../../styles';

const Strings = {
  INFO: I18n.t('socialMediaCopyLinkInstruction'),
  TUTORIAL_BUTTON_LABEL: I18n.t('goToCompleteTutorial'),
  COPY_LINK_BUTTON_LABEL: I18n.t('copyIntegrationFeedLink'),
};

const UrlCopyPage = (props) => {
  const {
    navigation,
    pageTitle,
    image,
    info,
    tutorialLink,
    successCopiedModalSetup,
    feedPartner,
    tipIndex,
  } = props;

  // State
  const [showSuccessCopiedLinkModal, setShowSuccessCopiedLInkModal] = useState(false);
  const [feedUrl, setFeedUrl] = useState();
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    generateFeedUrl(feedPartner).then(setFeedUrl);
  }, [ ]);

  // Aux methods
  const goToTutorial = () => Linking.openURL(tutorialLink);

  const copyFeedUrlLink = () => {
    Clipboard.setString(feedUrl);
    setShowSuccessCopiedLInkModal(true);
  };

  // Generate infos
  const infos = [
    { text: Strings.INFO.text1 },
    { text: Strings.INFO.text2, bold: true },
    { text: `${Strings.INFO.text3} ${info}.` },
  ];

  // RENDER methods

  // Buttons
  const renderButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        <ActionButton
          cancel
          onPress={goToTutorial}
          style={styles.buttonMargin}
        >
          {Strings.TUTORIAL_BUTTON_LABEL}
        </ActionButton>

        <ActionButton
          onPress={copyFeedUrlLink}
          rightIcon={<KyteIcon name={'copy'} color={'white'}/>}
          subtitle={feedUrl}
        >
          {Strings.COPY_LINK_BUTTON_LABEL}
        </ActionButton>
      </View>
    );
  };

  // Content
  const renderImage = () => (
    <View>
      <Image
        source={{ uri: image.src }}
        style={image.style}
      />
    </View>
  );

  const renderInfoPart = (part, i) => (
    <KyteText
      key={i}
      weight={part.bold ? 'SemiBold' : 'Regular'}
      size={18}
      textAlign={'center'}
      lineHeight={30}
    >
      {part.text}
    </KyteText>
  );

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <KyteText>
        {infos.map(renderInfoPart)}
      </KyteText>
    </View>
  );

  const renderContent = () => (
    <CenterContent style={styles.contentContainer}>
      {image ? renderImage() : null}
      {info ? renderInfo() : null}
    </CenterContent>
  );

  const renderSuccessCopiedLinkModal = () => (
    <SuccessCopiedLinkModal
      isModalVisible={showSuccessCopiedLinkModal}
      hideModal={() => setShowSuccessCopiedLInkModal(false)}
      navigation={navigation}
      { ...successCopiedModalSetup }
    />
  );

  

  const rightButtons = [
    { icon: 'help', color: colors.grayBlue, onPress: () => setShowTip(true), iconSize: 20 },
  ];

  return (
    <DetailPage
      goBack={navigation.goBack}
      pageTitle={pageTitle}
      rightButtons={rightButtons}
    >
      {renderContent()}
      {renderButtons()}
      {renderSuccessCopiedLinkModal()}
      {renderTip(showTip, setShowTip, tipIndex)}
    </DetailPage>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
  },
  infoContainer: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  buttonsContainer: {
    paddingVertical: 10,
  },
  buttonMargin: {
    marginBottom: 10,
  },
});

export default UrlCopyPage;
