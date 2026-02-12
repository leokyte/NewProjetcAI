import React from 'react';
import { View, Dimensions } from 'react-native';
import { KyteText, KyteIcon, KyteButton } from '../common';
import { HelperStepsStates } from '../../enums';
import I18n from '../../i18n/i18n';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const stepState = (state) => HelperStepsStates.items[HelperStepsStates[state]].id;
const completed = stepState('COMPLETED');
const disabled = stepState('DISABLED');

const HelperStep = ({ height, step, state, status, onPress }) => {
  return (
    <View style={styles.wrapper(height)}>
      <View style={styles.container(state, height)}>
        <View style={styles.content}>
          <KyteIcon
            style={styles.icon}
            size={iconSize}
            color={state.icon}
            name={status === completed ? 'check-inner' : step.icon}
          />
          <KyteText
            size={textSize}
            lineHeight={SMALL_SCREENS ? 11 : 16}
            textAlign="center"
            color={state.contentText}
            marginBottom={10}
          >
            {step.info}
          </KyteText>
        </View>
        {status !== completed ? (
          <KyteButton
            onPress={() => onPress(step)}
            disabled={status === disabled}
            height={buttonHeight}
            background={state.btnBackground}
            borderWidth={1}
            borderColor={state.btnBorder}
          >
            <KyteText size={textSize} weight="Medium" color={state.btnText}>
              {step.cta}
            </KyteText>
          </KyteButton>
        ) : (
          <KyteText
            textAlign="center"
            lineHeight={buttonHeight}
            size={textSize}
            color={state.btnText}
          >
            {`${I18n.t('expressions.completed')}!`}
          </KyteText>
        )}
      </View>
    </View>
  );
};

const tileSpacing = 5;
const textSize = SMALL_SCREENS ? 11 : 12;
const iconSize = SMALL_SCREENS ? 16 : 20;
const buttonHeight = SMALL_SCREENS ? 33 : 40;

const styles = {
  wrapper: (height = 150) => ({
    width: '50%',
    padding: tileSpacing,
    height,
  }),
  container: (state) => ({
    backgroundColor: state.boxBackground,
    borderColor: state.boxBorder,
    borderWidth: 1,
    borderRadius: 6,
    padding: tileSpacing,
    flex: 1,
  }),
  content: {
    flex: 1,
    justifyContent: SMALL_SCREENS ? 'space-around' : 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  icon: {
    marginBottom: SMALL_SCREENS ? 0 : 8,
  },
};

export default HelperStep;
