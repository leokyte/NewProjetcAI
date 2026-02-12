import React from 'react';
import { Container, Row } from '@kyteapp/kyte-ui-components';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { colors } from '../../styles';
import { CartStack, CurrentSaleStack } from '../';

const CurrentSaleTablet = () => (
  <Row flex={1}>
    <Container flex={1}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <CurrentSaleStack />
        </NavigationContainer>
      </NavigationIndependentTree>
    </Container>
    <Container width={320} borderLeftWidth={1} borderColor={colors.borderColor}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <CartStack initialParams={{ origin: 'sale' }}/>
        </NavigationContainer>
      </NavigationIndependentTree>
    </Container>
  </Row>
);

export default CurrentSaleTablet;
