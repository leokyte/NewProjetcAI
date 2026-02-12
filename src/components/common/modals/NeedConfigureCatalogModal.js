import React from 'react'
import { View, ScrollView, Dimensions, Image } from 'react-native'
import { KyteText, KyteButton, Margin, Padding } from '@kyteapp/kyte-ui-components'
import { KyteModal } from '../KyteModal'
import { colors } from '../../../styles'
import { renderBoldText } from '../../../util'
import I18n from '../../../i18n/i18n';
import NavigationService from '../../../services/kyte-navigation'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SMALL_SCREENS = SCREEN_HEIGHT <= 568

const Strings = {
    t_cancel: I18n.t('alertDismiss'),
    t_button: I18n.t('createCatalogFirstModal.modalConfirmButton'),
    t_title: I18n.t('createCatalogFirstModal.modalTitle'),
}

const modalStyles = {
    titleView: {
        paddingHorizontal: 30,
    },
    infoView: {
        paddingHorizontal: 10,
    },
}
const NeedConfigureCatalogModal = ({
    hideModal,
    isVisible,
    image,
    imgStyles,
    subtitle,
}) => {
    const ImageComponent = typeof image === "string" ? 
        <Image source={{ uri: image }} style={{ ...imgStyles, alignSelf: 'center' }} />
        : <View style={{ alignSelf: 'center' }}>{image}</View>
    
    const onPress = () => {
        hideModal()
        NavigationService.navigate("OnlineCatalog", "CatalogUrlFriendly")
    }

    return(
        <KyteModal height={SMALL_SCREENS ? '100%' : 'auto'} title=" " isModalVisible={isVisible} noEdges hideModal={() => hideModal()}>
            <ScrollView>
                <View>
                    {ImageComponent}
                </View>

                <Margin top={20} />

                <View style={modalStyles.titleView}>
                    <KyteText size={20} lineHeight={28} weight={500} color={colors.actionDarkColor} style={{ textAlign: 'center' }}>
                        {Strings.t_title}
                    </KyteText>
                </View>

                <Margin top={25} />

                <View style={modalStyles.infoView}>
                    <KyteText size={16} lineHeight={24} style={{ textAlign: 'center' }}>
                        {renderBoldText(I18n.t(subtitle), { size: 18, lineHeight: 24 })}
                    </KyteText>
                </View>
            </ScrollView>

            <Margin top={35} />

            <Padding bottom={20}>
                <View>
                    <KyteButton
                        width="100%"
                        onPress={() => onPress()}
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
                                onPress={() => hideModal()}
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
}

export default NeedConfigureCatalogModal
