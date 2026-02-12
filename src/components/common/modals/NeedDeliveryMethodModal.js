import React from 'react'
import { View, ScrollView, Dimensions, Image } from 'react-native'
import { KyteText, KyteButton, Margin, Padding } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../KyteModal'
import { colors } from '../../../styles'
import { renderBoldText } from '../../../util'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const modalStyles = {
	titleView: {
		paddingHorizontal: 20,
	},
	infoView: {
		paddingHorizontal: 10,
	}
}
const NeedDeliveryMethodModal = ({ hideModal, isVisible, imageURI, onPressFirstButton, onPressSecondButton, strings }) => {
    const { t_first_button, t_second_button, t_subtitle, t_title } = strings

    return (
        <KyteModal
            height={SMALL_SCREENS ? '100%' : 'auto'}
            title=" "
            isModalVisible={isVisible}
            noEdges
            hideModal={() => hideModal()}
        >
            <ScrollView>
                <View>
                    <Image source={{ uri: imageURI }} style={{ height: 140, width: 140, alignSelf: 'center' }} />
                </View>

                <Margin top={20} />

                <View style={modalStyles.titleView}>
                    <KyteText
                        size={20}
                        lineHeight={33}
                        weight={500}
                        color={colors.actionDarkColor}
                        style={{ textAlign: 'center' }}
                    >
                        {t_title}
                    </KyteText>
                </View>

                <Margin top={12} />

                <View style={modalStyles.infoView}>
                    <KyteText size={16} lineHeight={25} textAlign="center">
                        {renderBoldText(t_subtitle, { size: 16, lineHeight: 25 })}
                    </KyteText>
                </View>
            </ScrollView>

            <Margin top={20} />

            <Padding bottom={20}>
                <View>
                    <KyteButton
                        width="100%"
                        onPress={onPressFirstButton}
                        type="primary"
                        size="default"
                        textStyle={{ paddingHorizontal: 5 }}
                    >
                        <KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
                            {t_first_button}
                        </KyteText>
                    </KyteButton>

                    {
                        onPressSecondButton && (
                            <Margin top={16}>
                                <View>
                                    <KyteButton
                                        width="100%"
                                        onPress={onPressSecondButton}
                                        type="primary"
                                        size="default"
                                        textStyle={{ paddingHorizontal: 5 }}
                                    >
                                        <KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
                                            {t_second_button}
                                        </KyteText>
                                    </KyteButton>
                                </View>
                            </Margin>
                        )
                    }
                </View>
            </Padding>
        </KyteModal>
    )
}

export default NeedDeliveryMethodModal
