import React, { useState } from 'react';
import { connect } from 'react-redux'
import { getFormValues, change } from 'redux-form'
import { Image, Platform, ScrollView, View } from 'react-native'
import { Container, Margin, KyteText } from '@kyteapp/kyte-ui-components';
import KyteInput from '@kyteapp/kyte-ui-components/src/packages/form/kyte-input/KyteInput';
import { colors } from '../../../styles'
import { ActionButton, CustomKeyboardAvoidingView, DetailPage } from '../../common'
import I18n, { getLocale } from '../../../i18n/i18n'
import { PostOrderImg } from '../../../../assets/images/catalog/post-order'
import { PostOrderImgEN } from '../../../../assets/images/catalog/post-order-en'
import { PostOrderImgES } from '../../../../assets/images/catalog/post-order-es'
import { storeAccountSave } from '../../../stores/actions';
import { renderBoldText } from '../../../util';
import { logEvent } from '../../../integrations';

const Strings = {
    PAGE_TITLE: I18n.t('postOrderOrientation.pageTitle'),
    POST_ORDER_SUBTITLE: I18n.t('postOrderOrientation.subtitle'),
    DEFAULT_MESSAGE: I18n.t('postOrderOrientation.defaultText'),
}

const PostOrder = (props) => {
    const locale = getLocale()
    const images = {
        en: PostOrderImgEN,
        es: PostOrderImgES,
        pt: PostOrderImg,
    }
    const { checkoutCustomMessage } = props.catalogConfig
    const [value, setValue] = useState(checkoutCustomMessage === undefined 
        ?  Strings.DEFAULT_MESSAGE
        : checkoutCustomMessage)
    const { storeAccount, navigation, storeAccountSave } = props
    const IMG_WIDTH = 284

    const handleChangeInput = (val) => {
        setValue(val)
    }

    const handleSave = () => {
        const catalog = {
			...storeAccount.catalog,
            checkoutCustomMessage: value
		}
		const store = { ...storeAccount, catalog }
        if (value !== checkoutCustomMessage) {
            if (!value) {
                logEvent('Catalog Success Message Delete')
            } else {
                logEvent('Catalog Success Message Update', { order_success_message: value })
            }
        }
		storeAccountSave(store, () => {
			navigation.goBack()
		})


	}

    return(
        <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()}>
            <Container flex={1}>
                <View style={styles.itemContainer}>
                        <ScrollView>
                            <KyteText>
                                {renderBoldText(Strings.POST_ORDER_SUBTITLE)}
                            </KyteText>

                            <Margin top={50} />

                            <View style={styles.txtImgContainer}>
                                <View style={[styles.imgText, { width: IMG_WIDTH - 130 }]}>
                                    <KyteText style={{textAlign: 'center'}} size={10}>
                                        {value}
                                    </KyteText>
                                </View>
                                <Image source={{ uri: images[locale] }} style={[styles.img, { width: IMG_WIDTH }]} />
                            </View>

                            <Margin top={50} />

                            <CustomKeyboardAvoidingView
                                style={{ flex: 1 }}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 137 : 0}
                                behavior={Platform.OS === 'ios' ? "position" : null}
                            >
                                <View style={styles.container}>
                                    <KyteInput
                                        value={value}
                                        onChangeText={handleChangeInput}
                                        inputProps={{ minHeight: 96, textAlignVertical: "top" }}
                                        returnKeyType='default'
                                        maxLength={200}
                                        showCountChar
                                        multiline
                                    />
                                </View>
                            </CustomKeyboardAvoidingView>
                        </ScrollView>
                </View>

                <ActionButton
                    style={{ marginBottom: 16, marginTop: 16 }}
                    onPress={handleSave}
                >
                    {I18n.t('descriptionSaveButton')}
                </ActionButton>
            </Container>
        </DetailPage>
    )
};

const styles = {
    container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        justifyContent: 'space-between'
	},
	itemContainer: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
        flex: 1,
	},
	innerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
        justifyContent: 'center'
	},
    imgText: {
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        wordBreak: 'break-all',
        padding: 10,
        position: 'absolute',
        zIndex: 1,
        top: '65%',
        transform: [{ translateY: -45 }],
    },
    img: {
        height: 290, 
        zIndex: 0,  
        alignSelf: 'center', 
        position: 'relative',
        textAlign: 'center',
        alignItems: 'center', 
        justifyContent: 'center', 
    },
    textArea: {
        minHeight: 96,
        borderWidth: 0.5,
        borderColor: colors.tipColor,
        borderRadius: 6,
        padding: 10
    },
    txtImgContainer: {
        alignItems: 'center', 
        justifyContent: 'center',
    }
}

const mapStateToProps = (state) => ({
	form: getFormValues('ConfigStoreOrderForm')(state),
	storeAccount: state.auth.store,
	checkoutGateways: state.auth.store.checkoutGateways || [],
	allowDelivery: state.auth.store.shippingFees ? state.auth.store.shippingFees.active : false,
    catalogConfig: state.auth.store.catalog
})

export default connect(mapStateToProps, { change, storeAccountSave })(PostOrder)
