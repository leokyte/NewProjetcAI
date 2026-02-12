import React from 'react';
import { useViewport, Row, Padding, Container, Viewports } from '@kyteapp/kyte-ui-components';

const TabletScreenContainer = ({ children, maxHeight }) => {
  const viewport = useViewport();
  const isMobile = viewport === Viewports.Mobile;

  const tabletContainer = () => (
    <Padding flex={1} all={20}>
      <Row justifyContent={'center'} alignItems="center" flex={1}>
        <Container
          flex={1}
          overflow={'hidden'}
          borderRadius={8}
          maxWidth={580}
          maxHeight={maxHeight}
          shadowColor={'black'}
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          backgroundColor={'white'}
        >
          {children}
        </Container>
      </Row>
    </Padding>
  );

  return !isMobile ? tabletContainer() : children;
};

export { TabletScreenContainer };
