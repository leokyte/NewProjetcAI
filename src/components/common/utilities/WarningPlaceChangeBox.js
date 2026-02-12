import { KyteText, Row } from '@kyteapp/kyte-ui-components';
import React from 'react';
import { View } from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements'
import { colors } from '../../../styles';

const styles = {
	infoContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
		borderRadius: 5,
		padding: 16
  }
}

const WarningPlaceChangeBox = ({ messages, onPress, subIsTitle, backgroundColor }) => onPress ? (
  <TouchableOpacity onPress={onPress}>
    <View style={{...styles.infoContainer, backgroundColor: backgroundColor || colors.lightBg}}>
      <Row alignItems='center' style={{marginRight: 16}}>
        <Icon name="info-outline" color={colors.primaryBg} size={20} />
        <View style={{ marginLeft: 10}}>
          {messages?.title && (
            <KyteText pallete="primaryBg" weight={500} size={14} style={{ lineHeight: 19.5 }}>
              {messages.title}
            </KyteText>
          )}
          
          
          <KyteText pallete="primaryBg" weight={subIsTitle ? 500 : 300} size={subIsTitle ? 14 : 12} style={{ lineHeight: 18  }}>
            {messages.subtitle}{' '}
            <KyteText pallete="primaryBg" weight={subIsTitle ? 500 : 300} size={subIsTitle ? 14 : 12} style={{ textDecorationLine: 'underline' }}>{messages.underlined}</KyteText>
          </KyteText>
        </View>
      </Row>
    </View>
  </TouchableOpacity>
) : (
  <View style={styles.infoContainer}>
    <Row alignItems='center' style={{marginRight: 16}}>
      <Icon name="info-outline" color={colors.primaryBg} size={20} />
      <View style={{ marginLeft: 10 }}>
        {messages?.title && (
          <KyteText pallete="primaryBg" weight={500} size={14} style={{ lineHeight: 19.5 }}>
            {messages.title}
          </KyteText>
        )}
        
        
        <KyteText pallete="primaryBg" weight={subIsTitle ? 500 : 300} size={subIsTitle ? 14 : 12} style={{ lineHeight: 18  }}>
          {messages.subtitle}{' '}
          <KyteText pallete="primaryBg" weight={subIsTitle ? 500 : 300} size={subIsTitle ? 14 : 12} style={{ textDecorationLine: 'underline' }}>{messages.underlined}</KyteText>
        </KyteText>
      </View>
    </Row>
  </View>
)


export default WarningPlaceChangeBox;
