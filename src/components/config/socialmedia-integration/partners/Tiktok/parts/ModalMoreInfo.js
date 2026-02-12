import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { KyteText } from '@kyteapp/kyte-ui-components';

import { ActionButton, PhoneInput, KyteModal, Input } from '../../../../../common';
import { emailValidate } from '../../../../../../util';
import { colors, scaffolding } from '../../../../../../styles';
import I18n from './../../../../../../i18n/i18n';

export const ModalMoreInfo = ({
  auth,
  toggleModalMoreInfo,
  isVisibleModalMoreInfo,
  storeAccountSave,
}) => {
  const [phone, setPhone] = useState(auth.store.phone || auth.user.phone || '');
  const [email, setEmail] = useState(auth.store.email || auth.user.email || '');
  const [formError, setFormError] = useState({});

  const Strings = {
    MODAL_TITLE: I18n.t('SocialmediaIntegration.moreInfo.title'),

    SUBTITLE_1: I18n.t('SocialmediaIntegration.moreInfo.subtitle.text1'),
    SUBTITLE_2: I18n.t('SocialmediaIntegration.moreInfo.subtitle.text2'),
    SUBTITLE_3: I18n.t('SocialmediaIntegration.moreInfo.subtitle.text3'),
    SUBTITLE_4: I18n.t('SocialmediaIntegration.moreInfo.subtitle.text4'),
    SUBTITLE_5: I18n.t('SocialmediaIntegration.moreInfo.subtitle.text5'),

    SAVE: I18n.t('SocialmediaIntegration.moreInfo.button.save'),
    LATER: I18n.t('SocialmediaIntegration.moreInfo.button.later'),
  };

  const saveMoreInfo = () => {
    const info = {
      ...auth.store,
      phone: `+${phone.replace(' ', '').replace('+', '')}`,
      email,
    };

    storeAccountSave(info);
  };

  const validateForm = () => {
    const validaEmail = emailValidate({ email });

    if (Object.keys(validaEmail).length === 0 && phone.length >= 3) {
      setFormError({});
    } else {
      setFormError(validaEmail);
      phone.length <= 3 && setFormError({ ...validaEmail, phone: I18n.t('customerValidatePhone') });
    }
  };

  const alertDescription = () => {
    const arrayError = [];
    formError.email && arrayError.push(formError.email);
    formError.phone && arrayError.push(formError.phone);

    return arrayError.join(['\n']);
  };

  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, email]);

  return (
    <KyteModal
      isModalVisible={isVisibleModalMoreInfo}
      bottomPage
      height="auto"
      topRadius={12}
      avoidKeyboard
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 12, paddingBottom: 30 }}>
          <KyteText
            size={19.2}
            color={colors.primaryBlack}
            weight={600}
            textAlign="center"
            marginTop={44}
            marginBottom={12}
          >
            {Strings.MODAL_TITLE}
          </KyteText>

          <KyteText size={14.4} textAlign="center" marginBottom={40}>
            {Strings.SUBTITLE_1}{' '}
            <KyteText weight={600} size={14.4}>
              {Strings.SUBTITLE_2}{' '}
            </KyteText>
            {Strings.SUBTITLE_3}{' '}
            <KyteText weight={600} size={14.4}>
              {Strings.SUBTITLE_4}{' '}
            </KyteText>
            {Strings.SUBTITLE_5}
          </KyteText>

          <Input
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder={I18n.t('words.s.email')}
            placeholderColor={colors.primaryGrey}
            autoCapitalize="none"
            onFocus={() => validateForm()}
            error={formError.email}
          />

          <PhoneInput
            value={phone}
            onChangeText={(text) => setPhone(text)}
            placeholder={I18n.t('storeInfoPhonePlaceholder')}
            onFocus={() => validateForm()}
            error={formError.phone}
          />
        </View>

        <View styles={scaffolding.bottomContainer}>
          <ActionButton
            onPress={toggleModalMoreInfo}
            style={{ marginBottom: 7, backgroundColor: 'transparent' }}
            textStyle={{ color: colors.actionColor }}
          >
            {Strings.LATER}
          </ActionButton>

          <ActionButton
            onPress={saveMoreInfo}
            style={{ marginBottom: 10 }}
            disabled={Object.keys(formError).length !== 0}
            alertDescription={alertDescription()}
          >
            {Strings.SAVE}
          </ActionButton>
        </View>
      </ScrollView>
    </KyteModal>
  );
};
