import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Platform, Text, TouchableOpacity, View, Keyboard, Dimensions } from 'react-native';
import { ColorPicker, fromHsv } from 'react-native-color-picker';
import Slider from '@react-native-community/slider';
import { isIphoneX, slugify } from '../../../../util';

import {
  ActionButton,
  CustomKeyboardAvoidingView,
  DetailPage,
  Input,
  KyteButton,
  KyteIcon,
  KyteModal,
  KyteSafeAreaView,
  KyteText,
  LoadingCleanScreen,
} from '../../../common';
import { colors, colorSet, scaffolding, Type } from '../../../../styles';
import I18n from '../../../../i18n/i18n';
import { preferenceSaveSaleStatus } from '../../../../stores/actions';

const Strings = {
  PAGE_TITLE_ADD: I18n.t('statusSettings.addPageTitle'),
  PAGE_TITLE_EDIT: I18n.t('statusSettings.editPageTitle'),
  ADD_STATUS_LABEL: I18n.t('addNewStatus'),
  EDIT_STATUS_LABEL: I18n.t('alertSave'),
  STATUS_FIELD_PLACEHOLDER: I18n.t('statusSettings.inputPlaceholder'),
  COLOR_SELECTOR_LABEL: I18n.t('statusSettings.colorSelector'),
  COLOR_PICKER_MODAL_TITLE: I18n.t('statusSettings.modalTitle'),
  COLOR_PICKER_MODAL_BUTTON_LABEL: I18n.t('statusSettings.selectColorButton'),
  INFORMATION_MSG: I18n.t('statusSettings.addStatusInfo'),
};

const CatalogOrderStatusAdd = (props) => {
  const STATUS_ADD = 'add';
  const STATUS_EDIT = 'edit';

  const { isLoaderVisible, route, navigation, formValues } = props;
  const { params = {} } = route;
  const { action = 'add' } = params;
  const { bottomContainer } = scaffolding;

  const paramsItem = params.item;

  const [selectedColor, setSelectedColor] = useState('#ce7da5');
  const [colorPickerSelectedColor, setColorPickerSelectedColor] = useState('#ce7da5');
  const [isColorPickerModalVisible, setColorPickerModalVisible] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');
  const [item, setItem] = useState({});

  useEffect(() => {
    if (action === STATUS_ADD) {
      setItem({});
      setSelectedColor('#ce7da5');
      setColorPickerSelectedColor('#ce7da5');
      setStatusLabel('');
    }

    if (action === STATUS_EDIT) {
      setItem(paramsItem);
      setSelectedColor(paramsItem?.color);
      setColorPickerSelectedColor(paramsItem?.color);
      setStatusLabel(paramsItem.alias);
    }
  }, [params.action, params.item]);

  const renderColorPickerModal = () => {
    const modalHeight = isIphoneX() ? 460 : 425;
    const windowWidth = Dimensions.get('window').width;
    const iconSize = 36;
    const circleSize = 140;
    const pickerContainer = {
      position: 'relative',
      flex: 1,
      paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    };
    const iconContainer = {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 110 : 125,
      left: windowWidth / 2,
      marginTop: -(circleSize / 2.1),
      marginLeft: -(circleSize / 2.1),
      backgroundColor: 'white',
      width: circleSize,
      height: circleSize,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: circleSize / 2,
      zIndex: 100,
    };

    return (
      <KyteSafeAreaView>
        <KyteModal
          bottomPage
          height={modalHeight}
          title={Strings.COLOR_PICKER_MODAL_TITLE}
          isModalVisible
          hideModal={() => setColorPickerModalVisible(false)}
        >
          <View style={pickerContainer}>
            <View style={iconContainer}>
              <KyteIcon size={iconSize} name="clock" color={colorPickerSelectedColor} />
            </View>
            <ColorPicker
              sliderComponent={Slider}
              onColorChange={(color) => setColorPickerSelectedColor(fromHsv(color))}
              style={{ flex: 1, paddingHorizontal: 10 }}
              defaultColor={selectedColor}
            />
          </View>
          <ActionButton
            style={{ marginBottom: 10 }}
            onPress={() => {
              setSelectedColor(colorPickerSelectedColor);
              setColorPickerModalVisible(false);
            }}
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={I18n.t('enterAllfields')}
          >
            {Strings.COLOR_PICKER_MODAL_BUTTON_LABEL}
          </ActionButton>
        </KyteModal>
      </KyteSafeAreaView>
    );
  };

  const checkNotValidFields = () => {
    return !statusLabel;
  };

  const saveStatus = () => {
    const status = {
      ...item,
      status: item.status || slugify(statusLabel),
      alias: statusLabel,
      color: selectedColor,
      active: true,
    };

    Keyboard.dismiss();
    props.preferenceSaveSaleStatus(status, action, () => navigation.goBack());
  };

  const renderClearButton = () => {
    const { iconClean } = styles;

    if (!formValues || !formValues.status) return null;

    return (
      <KyteButton
        width={40}
        height={27}
        onPress={() => props.change('status', '')}
        style={iconClean}
      >
        <KyteIcon name="close-navigation" size={10} color={colors.secondaryBg} />
      </KyteButton>
    );
  };

  const renderLoading = () => {
    return <LoadingCleanScreen />;
  };

  return (
    <DetailPage
      pageTitle={action === STATUS_ADD ? Strings.PAGE_TITLE_ADD : Strings.PAGE_TITLE_EDIT}
      goBack={() => {
        Keyboard.dismiss();
        navigation.goBack();
      }}
    >
      <CustomKeyboardAvoidingView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View>
            <Input
              placeholder={Strings.STATUS_FIELD_PLACEHOLDER}
              placeholderColor={colors.primaryGrey}
              style={[{ paddingHorizontal: 20, height: 40 }]}
              rightIcon={renderClearButton()}
              value={statusLabel}
              onChangeText={(value) => {
                setShowErrorMessage(!value);
                setStatusLabel(value);
              }}
              hideLabel
              editable
              autoFocus
              autoCorrect
            />
            {showErrorMessage ? (
              <Text style={[styles.onlineOrderDescription(colors.worstColor), { paddingLeft: 20 }]}>
                {I18n.t('catalogRequiredErrorMessage')}
              </Text>
            ) : null}
          </View>

          <View style={styles.secondaryContainer}>
            {action === STATUS_ADD ? (
              <KyteText
                size={13}
                pallete="grayBlue"
                style={{ textAlign: 'center', lineHeight: 15 }}
              >
                {Strings.INFORMATION_MSG}
              </KyteText>
            ) : null}

            <TouchableOpacity
              onPress={() => setColorPickerModalVisible(true)}
              style={styles.selectorContainer}
            >
              <KyteIcon
                style={Platform.OS === 'ios' ? styles.iconPositioning : null}
                size={14}
                name="clock-small"
                color={selectedColor}
              />
              <KyteText size={13} style={styles.statusText}>
                {Strings.COLOR_SELECTOR_LABEL}
              </KyteText>
              <KyteIcon
                style={styles.iconPositioning}
                size={12}
                name="nav-arrow-down"
                color={colors.primaryColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={() => saveStatus()}
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={I18n.t('enterAllfields')}
            disabled={checkNotValidFields()}
          >
            {action === STATUS_ADD ? Strings.ADD_STATUS_LABEL : Strings.EDIT_STATUS_LABEL}
          </ActionButton>
        </View>
      </CustomKeyboardAvoidingView>
      {isColorPickerModalVisible ? renderColorPickerModal() : null}
      {isLoaderVisible ? renderLoading() : null}
    </DetailPage>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  secondaryContainer: {
    paddingHorizontal: 40,
    paddingTop: 10,
  },
  onlineOrderDescription: (color) => [
    Type.fontSize(12),
    Type.Regular,
    colorSet(color || colors.grayBlue),
    { lineHeight: Platform.OS === 'ios' ? 16 : 20, paddingRight: 90 },
  ],
  iconClean: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    top: 1,
    paddingRight: 5,
  },
  selectorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 60,
  },
  statusText: {
    paddingLeft: 5,
    alignSelf: 'center',
  },
  iconPositioning: {
    position: 'relative',
    top: -1,
  },
};

export default connect((state) => ({ orderStatus: state.preference.orderStatus }), {
  preferenceSaveSaleStatus,
})(CatalogOrderStatusAdd);
