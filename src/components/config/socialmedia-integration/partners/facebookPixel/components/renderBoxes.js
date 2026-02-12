import React from 'react';
import { Linking, View } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import I18n from '../../../../../../i18n/i18n';

import { colors } from '../../../../../../styles/colors';
import { ActionButton, KyteIcon } from '../../../../../common';

const Strings = {
  TEXT_BOX_1: I18n.t('textBox1'),
  TEXT_BOX_2: I18n.t('textBox2'),
  TEXT_BOX_3: I18n.t('textBox3'),
  TEXT_BOX_4: I18n.t('textBox4'),
  TEXT_BOX_5: I18n.t('textBox5'),
  TEXT_BOX_6: I18n.t('textBox6'),
  TITLE_TIP: I18n.t('titleTip'),
  TEXT_TIP: `${I18n.t('textTip')} 😉`,

  TITLE_WE_HELP_YOU: I18n.t('titleWeHelpYou'),
  TEXT_WE_HELP_YOU: I18n.t('textWeHelpYou'),

  TUTORIAL_BUTTON_LABEL: I18n.t('tutorialFacebookPixelButtonLabel'),
  TUTORIAL_LINK: I18n.t('facebookPixelTutorialLink'),

  TITLE_INTEGRATED: I18n.t('integratedTitle'),
  TEXT_INTEGRATED: `${I18n.t('integratedText')} 🎉`,

  TEXT_PIXEL_CONNECTED: I18n.t('connectedPixelText'),

  TITLE_UNINSTALL: I18n.t('uninstallIntegrationBoxTitle'),
  TEXT_UNINSTALL: I18n.t('uninstallIntegrationBoxText'),
  GO_TO_FBE_PAGE_LABEL: I18n.t('goToFbePageLabel'),
};

const renderBoxes = (fbeIntegrated, navigate) => {
  const goToTutorial = () => Linking.openURL(Strings.TUTORIAL_LINK);
  const isFbeIntegrated = !!fbeIntegrated && fbeIntegrated.active;

  return (
    <>
      <View style={[styles.box, { marginTop: isFbeIntegrated ? 6 : null }]}>
        <View style={styles.iconCheck}>
          <KyteIcon
            name={isFbeIntegrated ? 'voucher' : 'check-inner'}
            size={isFbeIntegrated ? 16 : 26}
            color={isFbeIntegrated ? colors.primaryDarker : colors.actionColor}
            style={isFbeIntegrated ? null : styles.iconStyle}
          />
        </View>

        <KyteText
          size={16.2}
          lineHeight={24.3}
          weight={500}
          color={colors.primaryBlack}
          textAlign="center"
          marginTop={8}
          marginBottom={8}
          style={{ maxWidth: !isFbeIntegrated ? 320 : null }}
        >
          {isFbeIntegrated ? Strings.TITLE_INTEGRATED : Strings.TEXT_BOX_1}
        </KyteText>

        <KyteText
          size={14.4}
          lineHeight={21.6}
          color={colors.primaryDarker}
          textAlign="center"
          marginBottom={8}
          marginLeft={40}
          marginRight={40}
        >
          {isFbeIntegrated ? (
            Strings.TEXT_INTEGRATED
          ) : (
            <>
              <KyteText size={14.4} weight={500}>
                {Strings.TITLE_TIP}{' '}
              </KyteText>

              {Strings.TEXT_TIP}
            </>
          )}
        </KyteText>

        {isFbeIntegrated ? (
          <View style={styles.containerPixel}>
            <KyteText color={colors.primaryBlack} size={14.4} marginBottom={4}>
              {Strings.TEXT_PIXEL_CONNECTED}
            </KyteText>

            <KyteText color={colors.primaryBlack} size={16.2} weight={500}>
              {isFbeIntegrated ? fbeIntegrated.value : ''}
            </KyteText>
          </View>
        ) : null}
      </View>

      <View style={[styles.box, { paddingBottom: 38 }]}>
        <View style={styles.iconCheck}>
          <KyteIcon name={'warning'} size={18} color={colors.warningColor} />
        </View>

        <KyteText
          size={16.2}
          lineHeight={24.3}
          color={colors.primaryBlack}
          textAlign="center"
          marginTop={8}
          marginBottom={16}
          style={styles.textBox}
        >
          {Strings.TEXT_BOX_2}{' '}
          <KyteText size={16.2} weight={500}>
            {Strings.TEXT_BOX_3}{' '}
          </KyteText>
          {Strings.TEXT_BOX_4}{' '}
          <KyteText size={16.2} weight={500}>
            {Strings.TEXT_BOX_5}{' '}
          </KyteText>
          {Strings.TEXT_BOX_6}
        </KyteText>

        <KyteText
          size={14.4}
          lineHeight={21.6}
          color={colors.primaryDarker}
          textAlign="center"
          marginBottom={8}
          marginLeft={40}
          marginRight={40}
        >
          <KyteText
            size={16.2}
            lineHeight={24.3}
            weight={500}
            color={colors.primaryDarker}
            textAlign="center"
            marginBottom={8}
          >
            {Strings.TITLE_WE_HELP_YOU}
          </KyteText>
          {'\n'}
          {Strings.TEXT_WE_HELP_YOU}
        </KyteText>
      </View>

      <ActionButton
        cancel
        onPress={goToTutorial}
        style={styles.tutorialButton}
        textStyle={styles.textTutorialButton}
        hitSlop={{ top: 100, bottom: 100, left: 0, right: 0 }}
      >
        {Strings.TUTORIAL_BUTTON_LABEL}
      </ActionButton>

      {isFbeIntegrated ? (
        <View style={[styles.box, { marginTop: 24 }]}>
          <View style={styles.iconCheck}>
            <KyteIcon name={'cog'} size={20} color={colors.primaryDarker} />
          </View>

          <KyteText
            size={16.2}
            lineHeight={24.3}
            weight={500}
            color={colors.primaryBlack}
            textAlign="center"
            marginTop={12}
            marginBottom={8}
          >
            {Strings.TITLE_UNINSTALL}
          </KyteText>

          <KyteText
            size={16.2}
            lineHeight={24.3}
            color={colors.primaryDarker}
            textAlign="center"
            marginBottom={17}
            style={styles.textBox}
          >
            {Strings.TEXT_UNINSTALL}
          </KyteText>

          <ActionButton
            onPress={() => navigate('FBEPage')}
            style={styles.goToFbeButton}
            textStyle={styles.goToFbeLabel}
          >
            {Strings.GO_TO_FBE_PAGE_LABEL}
          </ActionButton>
        </View>
      ) : null}
    </>
  );
};

const styles = {
  box: {
    backgroundColor: colors.borderlight,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingTop: 4,
    paddingBottom: 24,
    marginBottom: 36,
  },

  iconCheck: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    borderColor: colors.borderlight,
    borderWidth: 1.5,
  },

  iconStyle: {
    marginLeft: -5,
    marginTop: 10,
  },

  textBox: {
    maxWidth: 318,
  },

  tutorialButton: {
    borderColor: colors.secondaryGrey,
    width: 194,
    height: 48,
    borderRadius: 8,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 15,
  },

  textTutorialButton: {
    fontSize: 14.4,
    color: colors.secondaryGrey,
  },

  containerPixel: {
    backgroundColor: colors.lightBg,
    borderColor: colors.disabledIcon,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  goToFbeButton: {
    width: 308,
    height: 47,
    borderRadius: 8,
  },

  goToFbeLabel: {
    fontSize: 14.4,
  },
};

export default renderBoxes;
