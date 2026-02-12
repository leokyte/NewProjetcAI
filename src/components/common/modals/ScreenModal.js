import React from 'react';
import { Modal } from 'react-native';
import { Container, Center } from '@kyteapp/kyte-ui-components';

const ScreenModal =
  (page, modalVisible = true) =>
  (props) => {
    const Content = page;
    const overlay = { backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10 };

    return (
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={props.navigation.goBack}
      >
        <Center flex={1} style={overlay}>
          <Container
            overflow={'hidden'}
            borderRadius={8}
            width={400}
            height={'100%'}
            maxHeight={600}
          >
            <Content {...props} />
          </Container>
        </Center>
      </Modal>
    );
  };

export default ScreenModal;
