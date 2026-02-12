import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { KyteModal, KyteText, KyteIcon, ActionButton } from '../';
import { colors } from '../../../styles';

const BottomSlideModal = (props) => {
  const {
    isModalVisible,
    hideModal,
    title,
    subtitle,
    image,
    info = [],
    infoStyle,
    infoContainerStyle,
    buttons = [],
  } = props;

  // RENDER methods
  const renderCloseButton = () => (
    <TouchableOpacity style={styles.closeButtonContainer} onPress={hideModal}>
      <KyteIcon name={'cross-thin'} color={colors.primaryDarker} size={18} />
    </TouchableOpacity>
  );

  const renderTitle = () => (
    <View style={styles.titleContainer}>
      <KyteText weight={'Medium'} size={16}>
        {title}
      </KyteText>
    </View>
  );

  const renderSubtitle = () => (
    <View style={styles.subTitleContainer}>
      <KyteText weight={'light'} size={14}>
        {subtitle}
      </KyteText>
    </View>
  );

  const renderImage = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: image.src }} style={image.style} />
    </View>
  );

  const renderInfoPart = (part, i) => (
    <KyteText
      key={i}
      weight={part.bold ? 600 : 'Regular'}
      size={14.4}
      textAlign={'center'}
      lineHeight={21.6}
    >
      {part.text}
    </KyteText>
  );

  const renderInfo = () => (
    <View style={[styles.infoContainer, {...infoContainerStyle}]}>
      <KyteText style={infoStyle}>{info.map(renderInfoPart)}</KyteText>
    </View>
  );

  const renderButton = (button, i) => (
    <ActionButton
      key={i}
      {...button}
      fontSize={14}
      style={i < buttons.length - 1 ? styles.marginButton : {}}
    >
      {button.text}
    </ActionButton>
  );

  const renderButtons = () => {
    return <View style={styles.buttonsContainer}>{buttons.map(renderButton)}</View>;
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {title ? renderTitle() : null}
      {subtitle ? renderSubtitle() : null}
      {image ? renderImage() : null}
      {info.length ? renderInfo() : null}
      {buttons.length ? renderButtons() : null}
    </View>
  );

  return (
    <KyteModal bottomPage transparent height={'100%'} isModalVisible={isModalVisible}>
      <View style={styles.containerWrapper}>
        <View style={styles.container}>
          {renderCloseButton()}
          {renderContent()}
        </View>
      </View>
    </KyteModal>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  closeButtonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  titleContainer: {
    marginTop: 10,
  },
  subTitleContainer: {
    marginTop: 4,
  },
  imageContainer: {
    marginTop: 20,
  },
  infoContainer: {
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  buttonsContainer: {
    width: '100%',
  },
  marginButton: {
    marginBottom: 10,
  },
});

export default React.memo(BottomSlideModal);
