import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { DetailPage, RadioOption, CurrencyText, ActionButton, KyteText } from '../../common';
import I18n from '../../../i18n/i18n';
import { colors } from '../../../styles';
import { applyShippingFee } from '../../../stores/actions';
import { checkUserPermission, generateTestID } from '../../../util';

const Strings = {
  t_page_title: I18n.t('ShippingFees.PageTitle'),
  t_no_fee: I18n.t('ShippingFees.NoFeeLabel'),
  t_edit_shipping_fees: I18n.t('ShippingFees.ManageFees'),
  t_save: I18n.t('words.s.proceed'),
  t_free_label: I18n.t('plansAndPrices.freeLabel'),
};

const ShippingFeesApply = (props) => {
  // Props
  const {
    navigation,
    shippingFees,
    currentSale,
    userPermissions,
  } = props;

  const isAdmin = checkUserPermission(userPermissions).isAdmin;

  const options = [{
    name: Strings.t_no_fee,
    value: -1,
  }].concat(shippingFees.fees.filter(fee => fee.active));

  //
  // State
  //
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    const fee = currentSale.shippingFee;
    if (fee) {
      const index = options.findIndex(f => f.name === fee.name);
      setSelectedIndex(index || 0);
    }
  }, []);

  //
  // Funcs
  //
  const goToShippingFees = () => {
    navigation.navigate({
      name: 'ShippingFees',
      key: 'ShippingFeesPage',
    });
  };

  const saveShippingFee = () => {
    const newFee = options.find((f, i) => i === selectedIndex && f.value >= 0);
    props.applyShippingFee(newFee);
    navigation.goBack();
  };

  //
  // Render
  //

  const renderOptionValue = (value) => value ?
                                       <CurrencyText value={value} style={styles.currencyStyle} /> :
                                        <KyteText style={styles.currencyStyle}>{Strings.t_free_label}</KyteText>;

  const renderOptions = (o, i) => (
    <View key={i}>
      <RadioOption
        onPress={() => setSelectedIndex(i)}
        selected={selectedIndex === i}
        item={{
          label: o.name,
          extraContent: o.value >= 0 ? () => renderOptionValue(o.value) : null,
        }}
      />
    </View>
  );

  const renderGoToShippinFeesEdit = () => (
    <View style={styles.goToShippingFeesContainer}>
      <TouchableOpacity onPress={goToShippingFees}>
        <KyteText
          pallete={'actionColor'}
          size={15}
          weight={'Medium'}
          testProps={generateTestID('mg-del-eodo')}
        >
          {Strings.t_edit_shipping_fees}
        </KyteText>
      </TouchableOpacity>
    </View>
  );

  const renderSaveButton = () => (
    <View style={styles.saveButtonContainer}>
      <ActionButton onPress={saveShippingFee} testProps={generateTestID('next-eodo')}>
        {Strings.t_save}
      </ActionButton>
    </View>
  );

  return (
      <DetailPage
        pageTitle={Strings.t_page_title}
        goBack={navigation.goBack}
      >
        <ScrollView >
          <View {...generateTestID('del-opt-list-eodo')}>
            {options.map(renderOptions)}
          </View>
        </ScrollView>
        {isAdmin ? renderGoToShippinFeesEdit() : null}
        {renderSaveButton()}
      </DetailPage>
  );
};

const styles = StyleSheet.create({
  currencyStyle: {
    color: colors.secondaryBg,
    fontSize: 13,
  },
  goToShippingFeesContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  saveButtonContainer: {
    paddingVertical: 15,
  },
});

export default connect(({ auth, currentSale }) => ({
  shippingFees: auth.store.shippingFees,
  currentSale,
  userPermissions: auth.user.permissions,
}), { applyShippingFee })(ShippingFeesApply);
