import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { View } from "react-native-animatable";
import { change, reduxForm } from 'redux-form'
import { isFree } from '@kyteapp/kyte-ui-components'
import { getForegroundOrNumberColor, isColorDefault, isHexString } from "../../../../util/util-color";
import { colorGrid, colors } from "../../../../styles";
import { logEvent } from "../../../../integrations";
import { ActionButton } from "../../../common";
import I18n from "../../../../i18n/i18n";
import { generateDefaultPROFeatures, getPROFeature, isBetaCatalog } from "../../../../util";
import { hasCatalog, openModalWebview, setCatalogColor, storeAccountSave } from "../../../../stores/actions";
import { CatalogColorType } from "../../../../enums";

const Strings = {
	DESCRIPTION_SAVE_BUTTON: I18n.t('descriptionSaveButton'),
	PROCEED: I18n.t('words.s.proceed'),
}

const SaveColorButton = (props) => {
	const [PROFeatures, setPROFeatures] = useState(generateDefaultPROFeatures('PROCustomColor'))
	const { storeAccount, hexColor, navigation, inputCatalogColorError, billing, openModalWebview: openProModalWebView } = props
	const { catalog } = storeAccount
	const isBetaActive = isBetaCatalog(catalog?.version)
	const itHasCatalog = props.hasCatalog()
	const [disableSaveButton, setDisableSaveButton] = useState(true)
	const isFreeUser = isFree(billing);

	const getDefaultColor = () => {
		const index = colorGrid.findIndex((color) => color.foreground === hexColor);
		return index !== -1 ? index : 0;
	};

	const saveColor = () => {
		if (isFreeUser && !isColorDefault(hexColor)) {
			openProModalWebView(PROFeatures.PROCustomColor.infoURL)
			return;
		}

		props.setIsLoading(true)
		const catalog = { 
			...storeAccount.catalog,  
			...(isBetaActive && !isFreeUser ? 
				{ themeColor: hexColor } : 
				{
					color: isHexString(hexColor) ? getDefaultColor() : hexColor,
					...( !itHasCatalog && { themeColor: hexColor } ) 
				 })
		}

		// changes catalog for ConfigStoreForm form. It is used to save the color chosen during the catalog wizard
		props.change('catalog', catalog)

		const store = {
			...storeAccount,
			catalog,
		}


		if (itHasCatalog) {
			logEvent(
				'Catalog Color Update', 
				{ 
					color_theme: isColorDefault(hexColor) ? getForegroundOrNumberColor(catalog, isBetaActive, CatalogColorType.NUMBER) : "custom",
					color_type: isColorDefault(hexColor) ? "preset" : "custom",
					...((isColorDefault(hexColor)) ? null : { custom_color: hexColor }),
				}
			)
			props.storeAccountSave(store, () => {
				props.setCatalogColor(hexColor)
				props.setIsLoading(false)

			})
		} else {
			props.setIsLoading(false)
			navigation.navigate({ name: 'CatalogLegalId', key: 'CatalogLegalIdPage' })
		}
	}
    
    useEffect(() => {
			const selectedColor = isBetaActive && !isFreeUser ? catalog?.themeColor : catalog?.color;
			const color = isHexString(selectedColor) ? hexColor : getDefaultColor().toString();
			const isDisabled = selectedColor === color;
			setDisableSaveButton(isDisabled);
		}, [hexColor, catalog, isBetaActive]);
	
		useEffect(() => {
			const getPROFeatures = async () => {
				props.setIsLoading(true)
				const PROCustomColor = await getPROFeature('PROCustomColor')
				setPROFeatures({ PROCustomColor })
				props.setIsLoading(false)
			}
			
			getPROFeatures()
		}, [billing.toleranceEndDate, billing.endDate, billing.status])

    return(
        <View style={styles.actionButtonView}>
            <View style={{ paddingVertical: 15 }}>
                <ActionButton noDisabledAlert onPress={saveColor} disabled={disableSaveButton || inputCatalogColorError}>
                    {itHasCatalog ? Strings.DESCRIPTION_SAVE_BUTTON : Strings.PROCEED}
                </ActionButton>
            </View>
        </View>
    )
}

const styles = {
    actionButtonView: {
        borderTopWidth: 1, 
        borderTopColor: colors.borderlight
    }
}

const validate = (values) => {
	if (!values.catalogColorInput) {
		return true
	}

	return false
}

const SaveColorButtonComponent = reduxForm({
	form: 'ConfigStoreForm',
	validate,
	destroyOnUnmount: false,
})(SaveColorButton)

export default connect(
    (state) => ({
			hexColor: state.catalog.color,
			storeAccount: state.auth.store,
			inputCatalogColorError: state.catalog.inputError,
			billing: state.billing
    }), { change, hasCatalog, storeAccountSave, setCatalogColor, openModalWebview }
  )(SaveColorButtonComponent);
