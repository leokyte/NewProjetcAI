import React, { Component } from 'react';
import { Platform, View, Text, Keyboard, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Field, reduxForm, change, getFormValues, isDirty } from 'redux-form';

import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import { colors, colorSet, scaffolding, Type } from '../../../../styles';
import {
  ActionButton,
  CustomKeyboardAvoidingView,
  DetailPage,
  Input,
  LoadingCleanScreen,
  SwitchContainer,
  TextButton,
} from '../../../common';

import { StoreFormModal } from '../../store/modal';
import I18n from '../../../../i18n/i18n';
import InputSection from '../layouts/InputSection';
import CatalogConfigTax from '../CatalogConfigTax';
import { storeAccountSave } from '../../../../stores/actions';
import { PaymentGatewayServiceType } from '../../../../enums';
import NeedDeliveryMethodModal from '../../../common/modals/NeedDeliveryMethodModal';
import { ActiveOneDeliveryMethod } from '../../../../../assets/images';

const Strings = {
  DELIVERY_TITLE: I18n.t('words.p.deliver'),
  PICKUP_TITLE: I18n.t('words.s.withdrawal'),
  TAX_TITLE: I18n.t('words.s.tax'),
  OTHER_PAYMENTS_TITLE: I18n.t('catalogConfig.otherPayments.label'),
  OTHER_PAYMENTS_LABEL: I18n.t('catalogConfig.otherPayments.title'),
  OTHER_PAYMENTS_DESC: I18n.t('catalogConfig.otherPayments.description'),
  CATALOG_DELIVER_ALERT: I18n.t('catalogDeliverAlert'),
  PAYMENTS_ALERT: I18n.t('catalogConfig.noPaymentsAlert'),
};

class CatalogOnlineOrderSettings extends Component {
  constructor(props) {
    super(props);
    const { catalogConfig, checkoutGateways, shippingFees } = props;
    const onlinePaymentsType =
      PaymentGatewayServiceType.items[PaymentGatewayServiceType.CATALOG].type;
    const hasPaymentGateway =
      !!checkoutGateways &&
      !!checkoutGateways.find(
        (cg) => cg.active && !!cg.services.find((s) => s.type === onlinePaymentsType && s.active),
      );
    this.state = {
      // States for Delivery
      // allowDelivery: catalogConfig.allowDelivery || false,
      allowDelivery: shippingFees.active || false,
      deliveryAreaDescription: catalogConfig.deliveryAreaDescription || '',
      deliveryTime: catalogConfig.deliveryTime || '',

      // States for Pick-Up
      allowLocalPickUp: catalogConfig.allowLocalPickUp || false,
      pickUpTime: catalogConfig.pickUpTime || '',

      // States for Taxes
      allowOnlineTax: catalogConfig.allowOnlineTax || false,

      // States for Other Payments
      // allowOnlinePayments: !!catalogConfig.allowOnlinePayments,
      allowOnlinePayments: hasPaymentGateway,
      allowOtherPayments: !!catalogConfig.allowOtherPayments,
      paymentsAllowedDescription: catalogConfig.paymentsAllowedDescription || '',

      showAddressErrorMessage: false,
      sectionFieldStoreModal: {},
      showStoreFormModal: false,
      defaultMaxLength: 140,
      showNeedActiveOneDeliveryMethodModal: false,
    };
  }

  componentDidMount() {
    const { catalogConfig, route } = this.props;
    const { params = {} } = route;
    const { who } = params;
    if (who === 'delivery') {
      this.props.change('allowDelivery', !!catalogConfig.allowDelivery);
      this.props.change('deliveryAreaDescription', catalogConfig.deliveryAreaDescription);
      this.props.change('deliveryTime', catalogConfig.deliveryTime);
    }

    if (who === 'pick-up') {
      this.props.change('allowLocalPickUp', !!catalogConfig.allowLocalPickUp);
      this.props.change('pickUpTime', catalogConfig.pickUpTime);
    }

    if (who === 'other-payments') {
      this.props.change('paymentsAllowedDescription', catalogConfig.paymentsAllowedDescription);
      this.props.change('allowOtherPayments', !!catalogConfig.allowOtherPayments);
    }
  }

  renderField(field) {
    return (
      <Input
        {...field.input}
        inputRef={field.inputRef}
        onChangeText={field.input.onChange}
        placeholder={field.placeholder}
        keyboardType={field.kind}
        style={field.style}
        placeholderColor={field.placeholderColor}
        maxLength={field.maxLength}
        autoCapitalize={field.autoCapitalize}
        error={field.meta.touched ? field.meta.error || field.meta.warning : ''}
        returnKeyType="done"
        value={field.input.value}
        autoFocus={field.autoFocus}
        multiline={field.multiline}
        numberOfLines={field.numberOfLines}
        textAlignVertical={field.textAlignVertical}
        rightIcon={field.rightIcon}
        rightIconStyle={field.rightIconStyle}
        onFocus={field.focusIn}
        hideLabel={field.hideLabel}
        onSubmitEditing={field.onSubmitEditing}
        editable={field.editable}
        autoCorrect
      />
    );
  }

  renderSwitchSection(sectionDetails, containerStyle, sectionStyle = null) {
    const { switchSection, switchSectionContainer, switchTitleStyle } = styles;
    const {
      title,
      titleStyle,
      description,
      descriptionStyle,
      onPressAction,
      stateListener,
      index,
      disableActiveBorder,
    } = sectionDetails;
    return (
      <View key={index || null} style={[switchSection(!disableActiveBorder), sectionStyle]}>
        <SwitchContainer
          title={title}
          titleStyle={[switchTitleStyle, titleStyle]}
          description={description}
          descriptionStyle={descriptionStyle}
          onPress={onPressAction}
          style={[switchSectionContainer, containerStyle]}
        >
          <KyteSwitch
            onValueChange={onPressAction}
            active={stateListener}
          />
        </SwitchContainer>
      </View>
    );
  }

  renderSection(sectionDetails) {
    const { sectionFieldContainer } = styles;
    const { title, required, placeholder, fieldName, disabled, error, instructions, modalIn } =
      sectionDetails;
    const validate = required && !disabled;

    const inputContainer = () => (
      <View style={sectionFieldContainer}>
        <Field
          placeholder={placeholder}
          placeholderColor={colors.primaryGrey}
          name={fieldName}
          component={this.renderField}
          style={[{ paddingHorizontal: 0, opacity: disabled ? 0.4 : 1 }, Platform.select({ ios: { height: 32 } })]}
          hideLabel
          editable={!disabled}
          warn={validate ? [(value) => value && value !== '' ? '' : error] : false}
          focusIn={modalIn ? () => {
            this.setState({ showStoreFormModal: true, sectionFieldStoreModal: sectionDetails });
            this[fieldName].blur();
          } : null}
          inputRef={(inputRef) => this[fieldName] = inputRef}
        />
      </View>
    );
    return (
      <InputSection
        title={title}
        instructions={instructions}
        required={required}
        disabled={disabled}
        inputContainer={() => inputContainer()}
      />
    );
  }

  renderButtonLink({ label, onPress, noPadding }) {
    return (
      <View style={noPadding ? {} : { paddingBottom: 15, paddingHorizontal: 20 }}>
        <TextButton
          onPress={() => onPress()}
          title={label}
          color={colors.actionColor}
          size={13}
          style={[Type.Medium]}
        />
      </View>
    );
  }

  changeItemState(item, nextState) {
    this.setState({ [item]: nextState });
    this.props.change(item, nextState);
  }

  renderDelivery() {
    const { allowDelivery } = this.state;
    const { section, onlineOrderDescription } = styles;

    const deliveryArea = {
      title: I18n.t('catalogWorksWithDelivery'),
      description: I18n.t('catalogWorksWithDeliveryText'),
      descriptionStyle: onlineOrderDescription(allowDelivery ? colors.primaryBg : false),
      onPressAction: () => this.changeItemState('allowDelivery', !allowDelivery),
      containerStyle: { paddingHorizontal: 20 },
      stateListener: allowDelivery,
    };

    const allowedDelivery = {
      title: I18n.t('catalogDeliveryArea'),
      required: true,
      placeholder: I18n.t('catalogDeliveryAreaPlaceholder'),
      fieldName: 'deliveryAreaDescription',
      disabled: !allowDelivery,
      error: I18n.t('catalogDeliveryAreaError'),
      modalIn: true,
    };
    const deliveryTime = {
      title: I18n.t('catalogDeliveryTimeTitle'),
      required: true,
      placeholder: I18n.t('catalogTimePlaceholder'),
      fieldName: 'deliveryTime',
      disabled: !allowDelivery,
      error: I18n.t('catalogRequiredErrorMessage'),
    };
    return (
      <View style={[section, { paddingHorizontal: 0, flex: 1 }]}>
        {this.renderSwitchSection(deliveryArea)}
        <View style={{ height: 220 }}>
          {allowDelivery ? this.renderSection(allowedDelivery) : null}
          {allowDelivery ? this.renderSection(deliveryTime) : null}
        </View>
      </View>
    );
  }

  renderPickUp() {
    const { section, onlineOrderDescription, pickUpAddressContainer } = styles;
    const { allowLocalPickUp, showAddressErrorMessage } = this.state;
    const { address, addressComplement } = this.props.formStoreConfigValues;
    const { onlineOrdersAllowed } = this.props.catalogConfig;
    const { shippingFees } = this.props;
    
    const onPressActionPickUp = () => {
      if(allowLocalPickUp && onlineOrdersAllowed && !shippingFees?.active) {
        this.setState({ showNeedActiveOneDeliveryMethodModal: true });
      } else {
        this.changeItemState('allowLocalPickUp', !allowLocalPickUp)
      }
    }

    const pickUp = {
      title: I18n.t('catalogWorksWithPickUp'),
      description: I18n.t('catalogWorksWithPickUpText'),
      descriptionStyle: onlineOrderDescription(allowLocalPickUp ? colors.primaryBg : false),
      onPressAction: onPressActionPickUp,
      containerStyle: { paddingHorizontal: 20 },
      stateListener: allowLocalPickUp,
    };
    const pickUpTime = {
      title: I18n.t('catalogPickUpTimeTitle'),
      required: true,
      placeholder: I18n.t('catalogTimePlaceholder'),
      fieldName: 'pickUpTime',
      disabled: !allowLocalPickUp,
      error: I18n.t('catalogRequiredErrorMessage'),
    };

    const pickUpAddress = () => {
      const pickUpAddressColor = colors.primaryDarker;
      return (
        <View style={pickUpAddressContainer}>
          {
            address ? (
              <View>
                <Text style={[onlineOrderDescription(pickUpAddressColor), { opacity: allowLocalPickUp ? 1 : 0.8 }]}>{address}</Text>
                <Text style={[onlineOrderDescription(pickUpAddressColor), { opacity: allowLocalPickUp ? 1 : 0.8 }]}>{addressComplement}</Text>
              </View>
            ) : null
          }
          {
            !address && showAddressErrorMessage ?
              <Text style={[onlineOrderDescription(colors.worstColor), { opacity: allowLocalPickUp ? 1 : 0.8 }]}>{I18n.t('catalogPickUpNoAddressError')}</Text> :
              null
          }
          <View style={{ marginVertical: 10 }}>
            {this.renderButtonLink({
              label: address ? I18n.t('catalogPickUpChangeAddressLabel') : I18n.t('catalogPickUpEnterAddressLabel'),
              onPress: () => this.props.navigation.navigate({ name: 'CatalogStore', key: 'CatalogStoreFromOrderConfig'}),
              noPadding: true,
            })}
          </View>
        </View>
      );
    };

    return (
      <View style={[section, { paddingHorizontal: 0, flex: 1 }]}>
        {this.renderSwitchSection(pickUp)}
        {allowLocalPickUp ? pickUpAddress() : null}
        {allowLocalPickUp ? this.renderSection(pickUpTime) : null}
      </View>
    );
  }

  renderTax() {
    const { section } = styles;
    const { allowOnlineTax } = this.state;
    const tax = { title: I18n.t('catalogTax'), onPressAction: () => this.changeItemState('allowOnlineTax', !allowOnlineTax), stateListener: allowOnlineTax, error: I18n.t('catalogRequiredErrorMessage') };

    return (
      <View style={section}>
        {this.renderSwitchSection(tax)}
        <CatalogConfigTax
          isTaxEnabled={allowOnlineTax}
          setAllowTaxProperty={() => this.validateMissinInfo()}
        />
      </View>
    );
  }

  renderOtherPayments() {
    const { onlineOrderDescription, section } = styles;
    const { allowOtherPayments } = this.state;
    const otherPayments = {
      title: Strings.OTHER_PAYMENTS_LABEL,
      description: Strings.OTHER_PAYMENTS_DESC,
      descriptionStyle: onlineOrderDescription(allowOtherPayments ? colors.primaryBg : false),
      onPressAction: () => this.changeItemState('allowOtherPayments', !allowOtherPayments),
      stateListener: allowOtherPayments,
    };

    const otherPaymentsSection = {
      title: I18n.t('catalogPaymentsAllowed'),
      required: true,
      placeholder: I18n.t('catalogPaymentsAllowedPlaceholder'),
      fieldName: 'paymentsAllowedDescription',
      error: I18n.t('catalogPaymentsError'),
      instructions: I18n.t('catalogPaymentsInstruction'),
      modalIn: true,
    };

    return (
      <View style={section}>
        {this.renderSwitchSection(otherPayments)}
        {allowOtherPayments ? this.renderSection(otherPaymentsSection) : null}
      </View>
    );
  }

  storeModalInfo(type) {
    const { defaultMaxLength } = this.state;
    switch (type) {
      case 'deliveryAreaDescription':
        return {
          title: I18n.t('catalogDeliveryArea'),
          maxLength: defaultMaxLength,
        };
      case 'paymentsAllowedDescription':
        return {
          title: I18n.t('catalogPaymentsAllowed'),
          maxLength: defaultMaxLength,
        };
      default:
        
    }
  }

  renderStoreFormModal() {
    const { formValues } = this.props;
    const { sectionFieldStoreModal } = this.state;
    const { fieldName, placeholder } = sectionFieldStoreModal;

    return (
      <StoreFormModal
        modalInfo={this.storeModalInfo(fieldName)}
        value={formValues[fieldName]}
        closeAction={() => this.setState({ showStoreFormModal: false })}
        buttonAction={this.saveStoreModalField.bind(this)}
        placeholder={placeholder}
      />
    );
  }

  saveStoreModalField(value) {
    const { fieldName } = this.state.sectionFieldStoreModal;
    this.changeItemState(fieldName, value);
    this.setState({ showStoreFormModal: false });
  }

  chooseComponent() {
    const { params = {} } = this.props.route;
    const { who } = params;

    if (who === 'delivery') return this.renderDelivery();
    if (who === 'pick-up') return this.renderPickUp();
    if (who === 'tax') return this.renderTax();
    if (who === 'other-payments') return this.renderOtherPayments();
    return null;
  }

  generateTitle() {
    const { params = {} } = this.props.route;
    const { who } = params;

    if (who === 'delivery') return Strings.DELIVERY_TITLE;
    if (who === 'pick-up') return Strings.PICKUP_TITLE;
    if (who === 'tax') return Strings.TAX_TITLE;
    if (who === 'other-payments') return Strings.OTHER_PAYMENTS_TITLE;
    return '';
  }

  validateMissinInfo(noBack = false, noLoading = false) {
    const {
      formValues = {},
      formStoreConfigValues: store,
      catalogConfig: catalog,
      route,
    } = this.props;
    const { allowDelivery, allowLocalPickUp, allowOnlineTax, allowOtherPayments } = this.state;
    const { deliveryAreaDescription, deliveryTime, pickUpTime, paymentsAllowedDescription } =
      formValues;
    const { params = {} } = route;
    const { who } = params;

    const saveDelivery = () => {
      if (allowDelivery && (!deliveryAreaDescription || !deliveryTime)) {
        return this.setState({ showAddressErrorMessage: true });
      }
      saveConfig({
        ...store,
        catalog: {
          ...catalog,
          allowDelivery,
          deliveryAreaDescription: deliveryAreaDescription || '',
          deliveryTime: deliveryTime || '',
        },
      });
    };
    const savePickUp = () => {
      if (allowLocalPickUp && (!pickUpTime || !store.address)) {
        return this.setState({ showAddressErrorMessage: true });
      }
      saveConfig({ ...store, catalog: { ...catalog, allowLocalPickUp, pickUpTime: pickUpTime || '' } });
    };
    const saveTax = () => {
      const hasTax = catalog && !!catalog.taxes[0];
      if (allowOnlineTax && !hasTax) {
        return this.setState({ showAddressErrorMessage: true });
      }
      saveConfig({ ...store, catalog: { ...catalog, allowOnlineTax } });
    };
    const saveOtherPayments = () =>
      saveConfig({
        ...store,
        catalog: { ...catalog, allowOtherPayments, paymentsAllowedDescription },
      });

    const saveConfig = (obj, callback) =>
      this.props.storeAccountSave({ ...obj, noLoading }, () => {
        if (callback) callback();
        if (!noBack) this.props.navigation.goBack();
      });

    if (!this.props.formValues) return false;

    Keyboard.dismiss();
    if (who === 'delivery') return saveDelivery();
    if (who === 'pick-up') return savePickUp();
    if (who === 'tax') return saveTax();
    if (who === 'other-payments') return saveOtherPayments();
  }

  checkNotValidFields() {
    const { params = {} } = this.props.route;
    const { who } = params;
    if (!this.props.formValues) return false;

    const { formValues, formStoreConfigValues: store, catalogConfig: catalog } = this.props;
    const {
      allowDelivery,
      allowLocalPickUp,
      allowOnlineTax,
      allowOtherPayments,
      allowOnlinePayments,
    } = this.state;
    const { deliveryAreaDescription, deliveryTime, pickUpTime, paymentsAllowedDescription } =
      formValues;

    const validateDelivery = () =>
      (allowDelivery && (!deliveryAreaDescription || !deliveryTime)) ||
      (!allowDelivery && !allowLocalPickUp);
    const validatePickUp = () => {
      const isFiledHasChanged = allowLocalPickUp !== catalog?.allowLocalPickUp || pickUpTime !== catalog?.pickUpTime;
      const isInvalidPickUp = allowLocalPickUp && (!pickUpTime || !store.address);
    
      return !isFiledHasChanged || isInvalidPickUp;
    }
    const validateTax = () => {
      const hasTax = catalog && !!catalog.taxes[0];
      return (allowOnlineTax && !hasTax);
    };
    const validateOtherPayments = () => {
      const catalogHasAtLeastOnePayment =
        (allowDelivery || allowLocalPickUp) && (allowOtherPayments || allowOnlinePayments);
      return !catalogHasAtLeastOnePayment || (allowOtherPayments && !paymentsAllowedDescription);
    };

    if (who === 'delivery') return validateDelivery();
    if (who === 'pick-up') return validatePickUp();
    if (who === 'tax') return validateTax();
    if (who === 'other-payments') return validateOtherPayments();
  }

  getErrorMessage() {
    const { params = {} } = this.props.route;
    const { who } = params;

    const { allowDelivery, allowLocalPickUp } = this.state;
    if ((who === 'delivery' || who === 'pick-up') && (!allowDelivery && !allowLocalPickUp)) {
      return Strings.CATALOG_DELIVER_ALERT;
    }

    return I18n.t('enterAllfields');
  }

  handleGoBack() {
    const { catalogConfig, navigation, formValues = {}, isTaxFormDirty, route } = this.props;
    const { params = {} } = route;
    const { who } = params;

    const {
      allowDelivery: stateAllowDelivery,
      deliveryAreaDescription: stateDeliveryAreaDescription,
      deliveryTime: stateDeliveryTime,

      allowLocalPickUp: stateAllowLocalPickUp,
      pickUpTime: statePickUpTime,

      allowOtherPayments: stateAllowOtherPayments,
      paymentsAllowedDescription: statePaymentsAllowedDescription,
    } = catalogConfig;

    const {
      allowDelivery,
      deliveryAreaDescription,
      deliveryTime,

      allowLocalPickUp,
      pickUpTime,

      allowOtherPayments,
      paymentsAllowedDescription,
    } = formValues;

    const fireAlert = () =>
      Alert.alert(I18n.t('unsavedChangesTitle'), I18n.t('unsavedChangesDescription'), [
        { text: I18n.t('alertDiscard'), onPress: () => navigation.goBack() },
        { text: I18n.t('alertSave'), onPress: null },
      ]);

    const isDeliveryInvalid =
      allowDelivery !== stateAllowDelivery ||
      deliveryAreaDescription !== stateDeliveryAreaDescription ||
      deliveryTime !== stateDeliveryTime;
    const isPickUpInvalid =
      allowLocalPickUp !== stateAllowLocalPickUp || pickUpTime !== statePickUpTime;
    const isOtherPaymentsInvalid =
      allowOtherPayments !== stateAllowOtherPayments ||
      paymentsAllowedDescription !== statePaymentsAllowedDescription;

    if (who === 'delivery' && isDeliveryInvalid) return fireAlert();
    if (who === 'pick-up' && isPickUpInvalid) return fireAlert();
    if (who === 'other-payments' && isOtherPaymentsInvalid) return fireAlert();
    if (who === 'tax' && isTaxFormDirty) return fireAlert();
    navigation.goBack();
  }

  renderNeedActiveOneDeliveryMethodModal() {
    const strings = {
      t_first_button: I18n.t('alertOk'),
      t_title: `${I18n.t('words.s.attention')}:`,
      t_subtitle: I18n.t('needActiveOneDeliveryMethod.subtitle'),
    }
    
    const hideModal = () => this.setState({ showNeedActiveOneDeliveryMethodModal: false })
    return (
        <NeedDeliveryMethodModal
          strings={strings}
          hideModal={hideModal}
          onPressFirstButton={hideModal}
          isVisible={this.state.showNeedActiveOneDeliveryMethodModal}
          imageURI={ActiveOneDeliveryMethod}
        />
     )
  }

  render() {
    const { isLoaderVisible, route } = this.props;
    const { params = {} } = route;
    const { who } = params;
    const { showStoreFormModal, showNeedActiveOneDeliveryMethodModal } = this.state;

    const editTax = who === 'tax';

    return (
      <DetailPage pageTitle={this.generateTitle()} goBack={() => this.handleGoBack()}>
        <CustomKeyboardAvoidingView style={styles.container}>
          <ScrollView>{this.chooseComponent()}</ScrollView>
          {!editTax ?
            <View style={scaffolding.bottomContainer}>
              <ActionButton
                style={{ marginBottom: 10 }}
                onPress={() => this.validateMissinInfo()}
                alertTitle={I18n.t('words.s.attention')}
                alertDescription={this.getErrorMessage()}
                disabled={this.checkNotValidFields()}
              >
                {I18n.t('descriptionSaveButton')}
              </ActionButton>
            </View>
           : null}
        </CustomKeyboardAvoidingView>
        {isLoaderVisible ? (<LoadingCleanScreen />) : null}
        {showStoreFormModal ? this.renderStoreFormModal() : null}
        {showNeedActiveOneDeliveryMethodModal ? this.renderNeedActiveOneDeliveryMethodModal() : null}
      </DetailPage>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  switchSection: (withBorder = true) => ({
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    paddingHorizontal: 20,
    borderBottomColor: colors.borderlight,
    borderBottomWidth: withBorder ? 1 : 0,
  }),
  switchSectionContainer: {
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    borderColor: '#FFFFFF',
  },
  switchTitleStyle: [Type.fontSize(14), Type.SemiBold, colorSet(colors.secondaryBg)],
  onlineOrderDescription: (color) => [
    Type.fontSize(12),
    Type.Regular,
    colorSet(color || colors.grayBlue),
    { lineHeight: (Platform.OS === 'ios') ? 16 : 20, paddingRight: 90 },
  ],
  sectionFieldContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    flex: 1,
  },
  pickUpAddressContainer: {
    paddingHorizontal: 20,
  },
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  installmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  allowOnlinePaymentDesc: {
    color: colors.primaryBg,
    width: '80%',
    fontSize: 12,
    lineHeight: Platform.select({ ios: 15, android: 20 }),
  },
  gatewayInfoContainer: {
    backgroundColor: colors.lightBg,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gatewayInfoTitle: {
    alignItems: 'flex-start',
    flex: 1,
  },
  gatewayInfoDesc: {
    alignItems: 'flex-end',
    flex: 1,
  },
  gatewayInfoImage: {
    width: 80,
    height: 20,
    marginLeft: 10,
  },
};

const CatalogOnlineOrderSettingsForm = reduxForm({
  form: 'CatalogOnlineOrderSettingsForm',
  destroyOnUnmount: true,
})(CatalogOnlineOrderSettings);

export default connect(
  (state) => {
    const { currency, decimalCurrency } = state.preference.account;
    return {
      formValues: getFormValues('CatalogOnlineOrderSettingsForm')(state) || {},
      catalogTaxFormValues: getFormValues('CatalogConfigTaxForm')(state) || {},
      isTaxFormDirty: isDirty('CatalogConfigTaxForm')(state),
      formStoreConfigValues: state.auth.store,
      catalogConfig: state.auth.store.catalog || {},
      checkoutGateways: state.auth.store.checkoutGateways || [],
      isLoaderVisible: state.common.loader.visible,
      currency,
      decimalCurrency,
      shippingFees: state.auth.store.shippingFees || {},
    };
  },
  { change, storeAccountSave },
)(CatalogOnlineOrderSettingsForm);
