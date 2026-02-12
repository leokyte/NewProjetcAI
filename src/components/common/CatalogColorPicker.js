import React, { useState, useEffect } from 'react';
import { Container, Margin, isFree } from '@kyteapp/kyte-ui-components';
import ColorPicker, { HSLSaturationSlider, HueSlider, LuminanceSlider } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';
import { connect } from 'react-redux';
import I18n from '../../i18n/i18n';
import { getInitialColor, isColorCloseToWhite, isHexString } from '../../util/util-color';
import { logEvent } from '../../integrations';
import { setCatalogColor, setInputCatalogColorError, setEnabledDrawerSwipe } from '../../stores/actions';
import { isBetaCatalog } from '../../util';
import { MaskedInput } from './MaskedInput';
import { colors } from '../../styles';

const Strings = {
  COLOR_ERROR: I18n.t('CustomColor.selectColorError')
};

const CatalogColorPicker = ({ where, catalog, billing, ...props }) => {
  const isBetaActive = isBetaCatalog(catalog?.version)
  const initialColor = getInitialColor(catalog, isBetaActive, isFree(billing))
  const [inputValue, setInputValue] = useState(initialColor);
  const isBordered = isColorCloseToWhite(props.hexColor)
  const LIMIT_OF_CHARACTERS = 7;
  
  const handleOnSelectColor = ({ hex }) => {
    'worklet';
    
    runOnJS(props.setCatalogColor)(hex);
    runOnJS(logEvent)("Catalog Color Canvas Change", where)
  };

  const handleChangeInput = () => {
    const finalColor = inputValue?.startsWith('#') ? inputValue : `#${inputValue}`;
    const isValidHex = isHexString(finalColor) && finalColor.length === LIMIT_OF_CHARACTERS;
    
    if (isValidHex) {
      props.setInputCatalogColorError(false)
      logEvent("Catalog Color HEX Change", where);
      handleOnSelectColor({ hex: finalColor });
    } else {
      props.setInputCatalogColorError(true);
    }
  };

  useEffect(() => {
    props.setEnabledDrawerSwipe(false);
  }, []);

  useEffect(() => {
    setInputValue(props.hexColor);
    props.setInputCatalogColorError(false)
  }, [props.hexColor]);

  return (
    <Container 
      flex={1} 
      justifyContent='center' 
      alignSelf='center' 
      width='100%' 
      paddingLeft={16}
      paddingRight={16}
      paddingTop={20}
      paddingBottom={16}
    >
      <Container flex={1}>
        <ColorPicker 
          value={props.hexColor} 
          onComplete={handleOnSelectColor} 
        >
          <HueSlider
            thumbColor='#FFF'
            sliderThickness={15}
            style={styles.picker.sliderStyle}
            thumbShape="circle"
            thumbInnerStyle={styles.picker.thumbInnerStyle}
            thumbSize={22}
            boundedThumb
          />
          <Margin top={20} />
          <LuminanceSlider
            thumbColor='#FFF'
            sliderThickness={15}
            thumbShape="circle"
            style={styles.picker.sliderStyle}
            thumbInnerStyle={styles.picker.thumbInnerStyle}
            thumbSize={22}
            boundedThumb
          />
          <Margin top={20} />
          <HSLSaturationSlider
            thumbColor='#FFF'
            sliderThickness={15}
            thumbShape="circle"
            style={styles.picker.sliderStyle}
            thumbInnerStyle={styles.picker.thumbInnerStyle}
            thumbSize={22}
            boundedThumb
          />
        </ColorPicker>
      </Container>
      <MaskedInput
        value={inputValue}
        onChangeText={text => setInputValue(text)}
        mask="#******"
        type="custom"
        maxLength={LIMIT_OF_CHARACTERS}
        onBlur={() => handleChangeInput()}
        error={props.inputError ? Strings.COLOR_ERROR : ''}
        rightIcon={(
          <Container
            backgroundColor={props.hexColor}
            height={20}
            width={20}
            borderRadius={10}
            marginBottom={10}
            borderColor={isBordered ? colors.lightGrey : 'transparent'}
            borderWidth={isBordered ? 0.3 : 0}
          />
        )}
      />
    </Container>
  );
};

const styles = {
  picker: {
    thumbInnerStyle: {
      borderColor: "#FFF"
    },
    sliderStyle: {
      borderRadius: 0,
      backgroundColor: "#FFF",
      color: "#FFF"
    }
  }
};

export default connect(
  (state) => ({
    hexColor: state.catalog.color,
    inputError: state.catalog.inputError,
    billing: state.billing
  }),
  { setEnabledDrawerSwipe, setCatalogColor, setInputCatalogColorError }
)(CatalogColorPicker);
