import React, { useState } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  DetailPage,
  ActionButton,
  SwitchContainer2,
  CustomKeyboardAvoidingView,
  Input,
  InputCurrency,
  InputToTextArea,
  KyteText,
  UnsaveChangesAlert,
} from '../../common';
import { StoreFormModal } from '../store/modal';
import I18n from '../../../i18n/i18n';
import { isEqual, generateTestID } from '../../../util';
import { colors } from '../../../styles';
import { FORM_NAME } from './ShippingFees';
import { set_form } from '../../../stores/actions';

const Strings = {
  PAGE_TITLE: I18n.t('ShippingFees.EditPageTitle'),
  SAVE: I18n.t('alertSave'),
  ACTIVATE_FEE: I18n.t('ShippingFees.ActivateFee'),
  NAME: I18n.t('namePlaceholder'),
  VALUE: I18n.t('cartItemValueLabel'),
  DESCRIPTION: I18n.t('productDescriptionLabel'),
  HINT: I18n.t('ShippingFees.EditPageHint'),
  EDIT: I18n.t('words.s.edit'),
};

const ShippingFeeEdit = (props) => {
  // Props
  const { navigation, route, _form } = props;

  // State
  const { params = {} } = route;
  const index = params.i;
  const indexNull = index === null;
  const defaultForm = { active: true, value: 0, name: '' };
  const initialProps = indexNull ? defaultForm : _form.fees[index];

  const [form, setForm] = useState(initialProps);
  const [showDescriptionTextarea, setShowDescriptionTextarea] = useState(false);
  const [showUnsaveChangesAlert, setShowUnsaveChangesAlert] = useState(false);

  // Funcs
  const goBack = () => navigation.goBack();

  const editForm = (payload) => setForm({ ...form, ...payload });

  const haveChanges = () => !isEqual(initialProps, form);

  const checkUnsaveChanges = () => {
    if (!haveChanges()) return goBack();
    return setShowUnsaveChangesAlert(true);
  };

  const checkSaveAllowed = () => {
    if (!haveChanges()) return false;
    if (form.name && form.value >= 0) return true;
    return false;
  };

  const saveForm = () => {
    props.set_form(FORM_NAME, {
      ..._form,
      fees: indexNull ? _form.fees.concat([form]) : _form.fees.map((f, i) => i === index ? form : f),
    });
    return goBack();
  };

  const removeFee = () => {
    props.set_form(FORM_NAME, {
      ..._form,
      fees: _form.fees.filter((f, i) => i !== index),
    });
    return goBack();
  };

  //
  // Render section
  //

  const rightButtons = !indexNull
    ? [
        {
          icon: 'trash',
          onPress: removeFee,
          testProps: generateTestID('remove-edo'),
        },
      ]
    : null;

  const renderSaveButton = () => (
    <View style={styles.saveButtonContainer}>
      <ActionButton
        onPress={saveForm}
        disabled={!checkSaveAllowed()}
        noDisabledAlert
        testProps={generateTestID('save-edo')}
      >
        {Strings.SAVE}
      </ActionButton>
    </View>
  );

  const renderActiveFeeSection = () => (
    <View>
      <SwitchContainer2
        title={Strings.ACTIVATE_FEE}
        value={form.active}
        onPressAction={() => editForm({ active: !form.active })}
        testProps={generateTestID('switch-edo')}
      />
    </View>
  );

  const renderName = () => (
    <View style={styles.inputContainer}>
      <Input
        placeholder={Strings.NAME}
        placeholderColor={colors.grayBlue}
        onChangeText={(name) => editForm({ name })}
        value={form.name}
        testProps={generateTestID('name-edo')}
      />
    </View>
  );
  const renderValue = () => (
    <View style={styles.inputContainer}>
      <InputCurrency
        placeholder={Strings.VALUE}
        placeholderColor={colors.grayBlue}
        onChangeText={(value) => editForm({ value })}
        value={form.value}
        testProps={generateTestID('value-edo')}
      />
    </View>
  );
  const renderDescription = () => (
    <View style={styles.inputContainer}>
      <InputToTextArea
        placeholder={Strings.DESCRIPTION}
        value={form.description}
        onFocus={() => setShowDescriptionTextarea(true)}
        testProps={generateTestID('desc-edo')}
      />
    </View>
  );

  const renderHint = () => (
    <View style={styles.hintContainer}>
      <KyteText pallete="grayBlue" size={13} lineHeight={18}>{Strings.HINT}</KyteText>
    </View>
  );

  const renderCrudSection = () => (
    <CustomKeyboardAvoidingView style={styles.crudSection}>
      {renderName()}
      {renderValue()}
      {renderDescription()}
      {renderHint()}
    </CustomKeyboardAvoidingView>
  );

  const renderDescriptionTextarea = () => {
    const closeAction = () => setShowDescriptionTextarea(false);
    return (
      <StoreFormModal
        modalInfo={{ title: Strings.DESCRIPTION, maxLength: 150 }}
        trueValue={form.description}
        onChangeText={(description) => editForm({ description })}
        closeAction={closeAction}
        buttonAction={closeAction}
        testID="description-delivery-active"
      />
    );
  };

  const renderUnsaveChangesAlert = () => (
    <UnsaveChangesAlert
      discardAction={goBack}
      saveAction={() => setShowUnsaveChangesAlert(false)}
      saveText={Strings.EDIT}
    />
  );

  return (
    <DetailPage
      goBack={checkUnsaveChanges}
      pageTitle={Strings.PAGE_TITLE}
      rightButtons={rightButtons}
      goBackTestProps={generateTestID('back-edo')}
    >
      <ScrollView>
        {renderActiveFeeSection()}
        {renderCrudSection()}
      </ScrollView>
      {renderSaveButton()}
      {showDescriptionTextarea ? renderDescriptionTextarea() : null}
      {showUnsaveChangesAlert ? renderUnsaveChangesAlert() : null}
    </DetailPage>
  );
};

const styles = StyleSheet.create({
  saveButtonContainer: {
    marginVertical: 10,
  },
  crudSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  hintContainer: {
    marginTop: 10,
  },
});

export default connect(
  ({ _form }) => ({
    _form: _form[FORM_NAME],
  }),
  { set_form },
)(ShippingFeeEdit);
