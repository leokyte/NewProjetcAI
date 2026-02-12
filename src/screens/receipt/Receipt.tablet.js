import React from 'react';
import { Container, Row } from '@kyteapp/kyte-ui-components';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { TabletScreenContainer, DelayedContent } from '../../components/common';
import { colors } from '../../styles';

import { ReceiptStack, ReceiptShareOptionsStack } from '../';

const ReceiptTablet = (initialRoute = 'Receipt') => (props) => {
  const Receipt = ReceiptStack(initialRoute);

  return (
    <Row flex={1}>
      <Container flex={1}>
        <TabletScreenContainer maxHeight={600}>
          <NavigationIndependentTree>
            <NavigationContainer>
              <Receipt initialParams={props.route?.params} />
            </NavigationContainer>
          </NavigationIndependentTree>
        </TabletScreenContainer>
      </Container>
      <DelayedContent>
        <Container width={320} borderLeftWidth={1} borderColor={colors.borderColor}>
          <NavigationIndependentTree>
            <NavigationContainer>
              <ReceiptShareOptionsStack initialParams={{...props.route?.params, ...props.route?.params?.params, isOuterPage: true }} />
            </NavigationContainer>
          </NavigationIndependentTree>
        </Container>
      </DelayedContent>
    </Row>
  );
};

export default ReceiptTablet;
