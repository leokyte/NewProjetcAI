import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { KyteText, ActionButton } from ".";
import { colors } from '../../styles';
import I18n from '../../i18n/i18n';
import WarningPlaceChangeBox from './utilities/WarningPlaceChangeBox';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');
const MODAL_WIDTH = SCREEN_WIDTH * 0.85;

//  PROPS
//
// - image
// - imageHeightProportion
// - imageWidth (optional)
// - imageContainerStyle (optional)
// - title
// - info
// + hideModal

class KyteModalAlert extends React.PureComponent {
  renderImage() {
    const { image, imageWidth, imageHeightProportion, imageContainerStyle } = this.props;
    const IMAGE_WIDTH = imageWidth ||  MODAL_WIDTH;

    return (
      <View style={imageContainerStyle}>
        <Image
          source={{ uri: image }}
          style={{ width: IMAGE_WIDTH, height: IMAGE_WIDTH * imageHeightProportion }}
        />
      </View>
    );
  }

  renderTitle() {
    const { title, titleColor } = this.props;
    return (
      <KyteText weight="Medium" size={18} color={titleColor} style={styles.title}>
        {title}
      </KyteText>
    );
  }

  renderInfo() {
    const { info } = this.props;
    return <KyteText style={styles.infoText}>{info}</KyteText>;
  }

  renderButton() {
    return (
      <ActionButton
        onPress={() => this.props.hideModal()}
        style={styles.actionButton}
      >
        {I18n.t('alertOk')}
      </ActionButton>
    );
  }

  renderWarning() {
    const { warningText } = this.props

    return (
      <WarningPlaceChangeBox
        messages={{
          subtitle: warningText,
        }}
        subIsTitle
      />
    );
  }

  render() {
    const { image } = this.props;

    return (
      <Modal
        isVisible
        style={styles.modalStyle}
        backdropColor={colors.primaryDarker}
        backdropOpacity={0.85}
      >
        <View style={styles.mainContainer}>
          {image ? this.renderImage() : null}
          <View style={styles.infoContainer}>
            {this.renderTitle()}
            {this.renderInfo()}
            {this.props.warningText && this.renderWarning()}
            
            {this.renderButton()}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = {
  modalStyle: {
    alignItems: 'center',
  },
  mainContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
    width: MODAL_WIDTH,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 15,
  },
  title: {
    marginTop: 10,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 15,
    marginTop: 15,
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  actionButton: {
    width: '100%',
  },
};

export { KyteModalAlert };
