import React from 'react'
import { View } from 'react-native'
import { KyteText, KyteButton, Margin, Padding } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../KyteModal'
import { colors } from '../../../styles'
import I18n from '../../../i18n/i18n';
import { renderBoldText } from '../../../util'

const Strings = {
    t_cancel: I18n.t('alertDismiss'),
    t_button: I18n.t('pixOrderArea.modalConfirmButton'),
    t_title: I18n.t('pixOrderArea.modalTitle'),
    t_content: I18n.t('pixOrderArea.modalContent'),
}


const PixConfirmOrderModal = ({
    hideModal,
    isVisible,
    onConfirm
}) => (
    <KyteModal 
        height="auto" 
        title={Strings.t_title} 
        isModalVisible={isVisible} 
        opacity={1}
        topRadius={16}
        bottomRadius={16}
        hideModal={hideModal} 
    >
        <KyteText size={16} textAlign="center">
            {renderBoldText(Strings.t_content, {size: 16})}
        </KyteText>

        <Padding top={16}>
            <View>
                <KyteButton
                    width="100%"
                    onPress={onConfirm}
                    type="primary"
                    size="default"
                    textStyle={{ paddingHorizontal: 5 }}
                >
                    <KyteText size={16} lineHeight={20} weight={500} color={colors.white}>
                        {Strings.t_button}
                    </KyteText>
                </KyteButton>

                <Margin top={16}>
                    <View>
                        <KyteButton
                            onPress={hideModal}
                            backgroundColor="#F7F7F8"
                            type="primary"
                            borderColor='#F7F7F8'
                        >
                            <KyteText size={16} lineHeight={20} weight={500}>
                                {Strings.t_cancel}
                            </KyteText>
                        </KyteButton>
                    </View>
                </Margin>
            </View>
        </Padding>
    </KyteModal>
)

export default PixConfirmOrderModal
