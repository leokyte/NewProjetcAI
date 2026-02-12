import React, { Component } from 'react';
import { View, Platform, Alert, ScrollView } from 'react-native';
import { change, reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import { KyteSwitch } from '@kyteapp/kyte-ui-components';
import {
  SwitchContainer,
  Input,
  MaskedInput,
  CheckList,
  ActionButton,
  TextButton,
  LoadingCleanScreen,
  ModalTax,
} from '../../common';
import { colors, colorSet, scaffolding, Type } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { Features, TaxPercentFixedTypes, TaxType, toList } from '../../../enums';
import { isFixedTax } from '../../../util';
import { checkPlanKeys, catalogTaxesSave } from '../../../stores/actions';
import { logEvent } from '../../../integrations';

class CatalogConfigTax extends Component {
  constructor(props) {
    super(props);

    const tax = props.initialValues || {};
    this.state = {
      optionalTax: tax.optional || false,
      deliveryOnly: !!tax.deliveryOnly,
      selectedTaxPercentFixedTypes: 0,
      taxPercentFixedTypes: [],
      selectedTaxType: 0,
      taxTypes: [],
      key: Features.items[Features.TAXES].key,
      isTaxesAllowed: true,
      showModal: false,
      modalTypeTaxIndex: 0,
    };
  }

  UNSAFE_componentWillMount() {
    const tax = this.props.initialValues || {};
    const productTax = tax.type === 'product-tax';
    const fixedTax = isFixedTax(tax);

    this.setState({
      taxPercentFixedTypes: TaxPercentFixedTypes.items,
      selectedTaxPercentFixedTypes: fixedTax ? TaxPercentFixedTypes.FIXED_TAX : TaxPercentFixedTypes.PERCENT_TAX,

      taxTypes: toList(TaxType),
      selectedTaxType: productTax ? TaxType.PRODUCT_TAX : TaxType.SALE_TAX,
    });

    // this.checkFeatureKey();
  }

  formSubmit({ name, percent, _id }) {
    const {
      optionalTax,
      deliveryOnly,
      selectedTaxType,
      taxTypes,
      taxPercentFixedTypes,
      selectedTaxPercentFixedTypes,
    } = this.state;
    const { user, auth, isTaxEnabled } = this.props;

    const tax = {
      _id,
      name,
      percent,
      userName: user.displayName,
      aid: auth.aid,
      uid: user.uid,
      active: isTaxEnabled,
      optional: optionalTax,
      deliveryOnly,
      type: taxTypes[selectedTaxType].name,
      typePercentFixed: taxPercentFixedTypes[selectedTaxPercentFixedTypes].name,
      isCatalog: true,
    };

    if ((!name || !percent) && isTaxEnabled) {
      Alert.alert(I18n.t('words.s.attention'), I18n.t('enterAllfields'), [
        { text: I18n.t('words.s.ok') },
      ]);
      return;
    }

    this.props.catalogTaxesSave(tax).then(() => {
      this.props.setAllowTaxProperty();
      logEvent('CatalogTaxConfigured');
    });
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
        error={field.meta.touched ? field.meta.error : ''}
        returnKeyType="done"
        value={field.input.value}
        autoFocus={field.autoFocus}
        multiline={field.multiline}
        textAlignVertical={field.textAlignVertical}
        rightIcon={field.rightIcon}
        rightIconStyle={field.rightIconStyle}
        onFocus={field.focusIn}
        hideLabel={field.hideLabel}
        onSubmitEditing={field.onSubmitEditing}
        editable={field.editable}
      />
    );
  }

  renderMaskedField(field) {
    const isPercentTax = field.selectedTaxPercentFixedTypes === TaxPercentFixedTypes.PERCENT_TAX;

    return (
      <MaskedInput
        {...field.input}
        onChangeText={field.input.onChange}
        onFocus={field.focusIn}
        onBlur={field.focusOut}
        placeholder={field.placeholder}
        keyboardType={field.kind}
        style={field.style}
        placeholderColor={field.placeholderColor}
        type={field.type}
        error={field.meta.touched ? field.meta.error : ''}
        returnKeyType="done"
        maxLength={field.maxLength}
        inputRef={field.inputRef}
        suffixUnit={isPercentTax ? '%' : false}
        editable={field.editable}
        noConvert
        hideUnit={isPercentTax}
        isPercent
      />
    );
  }

  renderSwitchDeliveryOnly() {
    const { section, switchTitleStyle, switchSectionContainer } = styles;
    const { deliveryOnly } = this.state;
    const activeDeliveryOnly = () => this.setState({ deliveryOnly: !deliveryOnly });
    return (
      <View style={section}>
        <SwitchContainer
          title={I18n.t('catalogTaxDeliveryOnlySwitch')}
          onPress={() => activeDeliveryOnly()}
          disabled={false}
          titleStyle={[switchTitleStyle]}
          style={[switchSectionContainer]}
        >
          <KyteSwitch
            onValueChange={() => activeDeliveryOnly()}
            active={deliveryOnly}
          />
        </SwitchContainer>
      </View>
    );
  }

  renderTaxInfo() {
    const { section } = styles;
    const { tax, isTaxEnabled } = this.props;

    const copyTax = () => {
      this.props.change('name', tax.name);
      this.props.change('percent', tax.percent);
      this.props.change('type', tax.type);
      this.props.change('typePercentFixed', tax.typePercentFixed);
    };

    return (
      <View style={section}>
        {tax ? (
          <View style={{ paddingTop: 20 }}>
            <TextButton
              onPress={() => copyTax()}
              title={I18n.t('catalogTaxCopyGeneral')}
              color={colors.actionColor}
              size={15}
              style={[Type.Medium]}
            />
          </View>
        ) : null}

        <View style={{ paddingVertical: 15 }}>
          <Field
            placeholder={I18n.t('taxesNamePlaceholder')}
            placeholderColor={colors.primaryGrey}
            name="name"
            component={this.renderField}
            inputRef={(input) => {
              this.taxName = input;
            }}
            style={[
              Platform.select({ ios: { height: 32 } }),
              { color: !isTaxEnabled ? colors.lightBorder : colors.primaryDarker },
            ]}
            editable={isTaxEnabled || false}
            autoCorrect
          />
          <Field
            placeholder={I18n.t('taxesValuePlaceholder')}
            placeholderColor={colors.primaryGrey}
            kind="numeric"
            name="percent"
            type="money"
            component={this.renderMaskedField}
            inputRef="value"
            style={[
              Platform.select({ ios: { height: 32 } }),
              { color: !isTaxEnabled ? colors.lightBorder : colors.primaryDarker },
            ]}
            editable={isTaxEnabled || false}
            selectedTaxPercentFixedTypes={this.state.selectedTaxPercentFixedTypes}
          />
        </View>
      </View>
    );
  }

  selectOption(option) {
    const { isTaxEnabled } = this.props;

    if (!isTaxEnabled) {
      return;
    }

    if (option === 1) {
      this.setState({ selectedTaxType: option, optionalTax: false });
      return;
    }
    this.setState({ selectedTaxType: option });
  }

  renderTaxPercentFixedOptions() {
    const { section } = styles;
    const { selectedTaxPercentFixedTypes, taxPercentFixedTypes, selectedTaxType } = this.state;
    const { isTaxEnabled } = this.props;

    return (
      <View style={[section, { paddingHorizontal: 0 }]}>
        <CheckList
          onPress={(option) => {
            if (!isTaxEnabled) return;
            this.setState({
              selectedTaxPercentFixedTypes: option,
              selectedTaxType: option === TaxPercentFixedTypes.FIXED_TAX ? TaxType.SALE_TAX : selectedTaxType
            });
          }}
          selected={selectedTaxPercentFixedTypes}
          options={taxPercentFixedTypes}
          disabled={!isTaxEnabled}
        />
      </View>
    );
  }

  renderTaxOptions() {
    const { isTaxEnabled } = this.props;
    const { section } = styles;
    const { selectedTaxType, taxTypes } = this.state;
    const options = taxTypes.concat([]);

    options[TaxType.SALE_TAX].tip = isTaxEnabled;
    options[TaxType.PRODUCT_TAX].tip = isTaxEnabled;

    options[TaxType.SALE_TAX].onPress = () => this.setState({ showModal: true, modalTypeTaxIndex: TaxType.SALE_TAX });
    options[TaxType.PRODUCT_TAX].onPress = () => this.setState({ showModal: true, modalTypeTaxIndex: TaxType.PRODUCT_TAX });

    return (
      <View style={[section, { paddingHorizontal: 0 }]}>
        <CheckList
          onPress={this.selectOption.bind(this)}
          selected={selectedTaxType}
          options={options}
          disabled={!isTaxEnabled}
        />
      </View>
    );
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  renderTipModal() {
    const { modalTypeTaxIndex, taxTypes } = this.state;
    const hideModal = () => this.setState({ showModal: false });

    return <ModalTax taxType={taxTypes[modalTypeTaxIndex]} hideModal={() => hideModal()} />;
  }

  render() {
    const { container } = styles;
    const { bottomContainer } = scaffolding;
    const { handleSubmit } = this.props;
    const { isTaxesAllowed, selectedTaxPercentFixedTypes, showModal } = this.state;

    return (
      <View style={container}>
        <ScrollView>
          {this.renderTaxInfo()}
          {this.renderSwitchDeliveryOnly()}
          {this.renderTaxPercentFixedOptions()}
          {selectedTaxPercentFixedTypes === TaxPercentFixedTypes.PERCENT_TAX ? this.renderTaxOptions() : null}
        </ScrollView>
        <View style={[bottomContainer]}>
          <ActionButton
            alertTitle={I18n.t('unsavedChangesTitle')}
            alertDescription={I18n.t('errorInField')}
            onPress={handleSubmit(this.formSubmit.bind(this))}
            cancel={!isTaxesAllowed}
          >
            {I18n.t('alertSave')}
          </ActionButton>
        </View>
        {showModal ? this.renderTipModal() : null}
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  switchSectionContainer: {
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    borderBottomColor: colors.primaryGrey,
  },
  switchTitleStyle: [Type.fontSize(14), Type.Regular, colorSet(colors.secondaryBg)],
  checkStyles: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 20,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    padding: 0,
  },
  checkboxText: [
    Type.Regular,
    colorSet(colors.primaryColor),
    Type.fontSize(14),
    { fontWeight: 'normal' },
  ],
};

const CatalogConfigTaxForm = reduxForm({
  form: 'CatalogConfigTaxForm',
})(CatalogConfigTax);

const mapStateToProps = ({ auth, taxes, common }) => ({
  auth,
  user: auth.user,
  initialValues: auth.store.catalog ? auth.store.catalog.taxes[0] : {},
  loader: common.loader,
  tax: taxes[0],
});

export default connect(mapStateToProps, { change, checkPlanKeys, catalogTaxesSave })(
  CatalogConfigTaxForm,
);
