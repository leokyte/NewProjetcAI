import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Container, Row, Padding, Margin, KyteSwitch } from '@kyteapp/kyte-ui-components';
import { KyteIcon, KyteText } from ".";
import { colors } from '../../styles';

const SwitchOptions = ({
  title,
  description,
  subDescripion,
  placeholder = '',
  onPress,
  onSwitch,
  active,
  icon,
  iconSize,
  switchToText,
  disabled,
  badge,
  leftComponent,
  rightComponent,
  titleSize
}) => (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.optionContainer(disabled)}
    >
      <Container justifyContent="center" minWidth={60} alignItems="center">
        <Padding horizontal={10}>
          {leftComponent || <KyteIcon size={iconSize || 24} name={icon} />}
        </Padding>
      </Container>
      <Container flex={1} justifyContent="center">
        <Padding horizontal={10}>
          <Row alignItems="center">
            <KyteText marginBottom={5} size={titleSize || 14} weight="Semibold" pallete="primaryDarker">
              {title}
            </KyteText>
            {badge ? (
              <View style={[styles.badge(badge.color), badge.style]}>
                <KyteText uppercase size={9} weight="Semibold" color="white">
                  {badge.info}
                </KyteText>
              </View>
            ) : null}
          </Row>
          {description ? (
            <KyteText
              size={11}
              weight='Regular'
              pallete='primaryColor'
            >
              {description}
            </KyteText>
          ) : null}
          {placeholder ? (
            <KyteText
              size={11}
              weight='Semibold'
              pallete='actionColor'
            >
              {placeholder}
            </KyteText>
          ) : null}
          {subDescripion ? (
            <KyteText
              marginTop={5}
              size={13}
              weight={subDescripion.weight}
              pallete={subDescripion.color}
            >
              {subDescripion.text}
            </KyteText>
          ) : null}
        </Padding>
      </Container>
      <Container justifyContent="center">
        <Padding horizontal={10}>
          {rightComponent || (
            !switchToText ? (
              <KyteSwitch
                onValueChange={onSwitch}
                active={active}
                disabled={disabled}
              />
            ) : (
            <Row justifyContent="center">
              <KyteText
                uppercase
                size={12}
                weight="Medium"
                pallete={active ? 'actionColor' : 'grayBlue'}
              >
                {active ? switchToText.on : switchToText.off}
              </KyteText>
              <Margin left={15}>
                <KyteIcon name="arrow-cart" size={10} style={styles.arrowSpacing} />
              </Margin>
            </Row>
          ))}
        </Padding>
      </Container>
    </TouchableOpacity>
  );

const styles = {
  optionContainer: (disabled) => ({
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
    opacity: !disabled ? 1 : 0.4,
  }),
  badge: (backgroundColor = colors.actionColor) => ({
    height: 18,
    backgroundColor,
    borderRadius: 3,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    position: 'relative',
    top: -3,
  }),
};

export { SwitchOptions };
