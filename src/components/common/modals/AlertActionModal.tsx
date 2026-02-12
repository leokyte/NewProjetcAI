import React from 'react';

import { Dimensions, Image, ScrollView } from 'react-native';
import { renderBoldText } from '../../../util';
import I18n from '../../../i18n/i18n';
import { KyteModal } from '../KyteModal';
import { AlertImage } from '../../../../assets/images/alert';
import { KyteText, KyteButton, Margin, Container, colors } from '@kyteapp/kyte-ui-components';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SMALL_SCREENS = SCREEN_HEIGHT <= 568;

const modalStyles = {
  infoView: {
    paddingHorizontal: 24
  }
};

interface Strings {
  title: string;
  button: string;
  subtitle: string;
}

interface AlertActionModalProps {
  isVisible: boolean;
  setHideModal: () => void;
  onPress: () => void;
  strings: Strings;
  hideAlertIcon?: boolean;
  shouldHideCancelBtn?: boolean;
}

const AlertActionModal = ({
  hideAlertIcon,
  strings,
  isVisible,
  setHideModal,
  onPress,
  shouldHideCancelBtn = false
}: AlertActionModalProps) =>
<KyteModal
  bottomRadius={16}
  topRadius={16}
  height={SMALL_SCREENS ? '100%' : 'auto'}
  isModalVisible={isVisible}
  noEdges
  title=" "
  hideModal={() => setHideModal()}>

		<ScrollView>
			{!hideAlertIcon &&
    <Image source={{ uri: AlertImage }} style={{ width: 140, height: 125, alignSelf: 'center' }} />
    }

			{!hideAlertIcon && <Margin top={30} />}

			<Container>
				<KyteText size={20} lineHeight={28} weight={500} color={colors.green01} style={{ textAlign: 'center' }}>
					{strings.title}
				</KyteText>
			</Container>

			<Margin top={12} />

			<Container style={modalStyles.infoView}>
				<KyteText size={16} lineHeight={24} style={{ textAlign: 'center' }} color={colors.gray02Kyte}>
					{renderBoldText(strings.subtitle, { size: 18, lineHeight: 24 })}
				</KyteText>
			</Container>
		</ScrollView>

		<Margin top={32} />

		<KyteButton
    width="100%"
    onPress={() => onPress()}
    type="primary"
    size="default"
    textStyle={{ paddingHorizontal: 5 }}>

			<KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
				{strings.button}
			</KyteText>
		</KyteButton>

		{!shouldHideCancelBtn &&
  <>
				<Margin top={16} />
				<Container>
					<KyteButton onPress={() => setHideModal()} backgroundColor="#F7F7F8" type="primary" borderColor="#F7F7F8">
						<KyteText size={16} lineHeight={20} weight={500}>
							{I18n.t('alertDismiss')}
						</KyteText>
					</KyteButton>
				</Container>
			</>
  }
	</KyteModal>;


export default AlertActionModal;
