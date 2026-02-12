import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { View, TouchableOpacity } from 'react-native'
import emojiFlags from 'emoji-flags'
import * as RNLocalize from 'react-native-localize'
import _ from 'lodash'
import { KyteText } from '@kyteapp/kyte-ui-components'
import { Input, KyteIcon, KyteModal, KyteCountrySelector, MaskedInput } from '.'
import { colors } from '../../styles'
import { kyteAccountGetCountries } from '../../services'
import I18n from '../../i18n/i18n'
import countryPhoneMasks from '../../util/util-phone-mask'

const DEFAULT_COUNTRY = { code: 'AA', dialCode: '+1', emoji: '🏳' }
const PhoneInputComponent = (props) => {
	const { placeholder, value, isWhatsApp, error, authStore, infoText, onFocus, onBlur } = props
	const [country, setCountry] = useState(DEFAULT_COUNTRY)
	const [countriesList, setCountriesList] = useState([])
	const [isCountrySelectorVisible, setIsCountrySelectorVisible] = useState(false)
	const countriesWithMoreThanOneMak = [{ code: 'MX', limitCharToUseAnotherMask: 13, numberOfMasks: 2 }]

	const findCountryByNumber = (countriesArray) => {
		if (value) {
			// eslint-disable-next-line no-plusplus
			for (let i = 1, code, countryFind; i <= value?.length; i++) {
				code = value?.startsWith('+') ? value?.slice(0, i) : `+${value?.slice(0, i)}`
				countryFind = countriesArray.find((c) => c.dialCode === code)
				if (countryFind) return setCountry(countryFind)
			}
		}

		const countryCode = authStore.country || RNLocalize.getCountry()
		const updatedCountry = countriesArray.find((d) => d.code === countryCode) || DEFAULT_COUNTRY

		if (updatedCountry?.code !== country?.code) {
			return setCountry(updatedCountry)
		}
	}

	const getCountries = async () => {
		try {
			let updatedCountriesList = countriesList

			if (!countriesList.length) {
				const res = await kyteAccountGetCountries(I18n.t('locale'))
				const filteredCountries = res.data.filter((c) => c.dialCode)
				const orderedCountries = _.orderBy(filteredCountries, ['name'], ['asc'])
				updatedCountriesList = orderedCountries

				setCountriesList(orderedCountries)
			}

			findCountryByNumber(updatedCountriesList)
		} catch (error) {
			console.log('Error getCountries', error.message)
		}
	}

	useEffect(() => {
		getCountries()
	}, [])

	const setChangeText = (text) => {
		const { onChangeText } = props
		onChangeText(text)
	}

	const setDialCode = () => {
		if (value) return
		setChangeText(country?.dialCode)
	}

	const renderCountrySelector = () => (
		<KyteModal
			height="100%"
			fullPage
			fullPageTitle={I18n.t('storeAccountCountryPlaceholder')}
			hideFullPage={() => setIsCountrySelectorVisible(false)}
			hideOnBack
			isModalVisible
		>
			<KyteCountrySelector
				onPress={(item) => {
					setCountry(item)
					setIsCountrySelectorVisible(false)
					setChangeText(item?.dialCode)
				}}
				data={countriesList}
			/>
		</KyteModal>
	)

	const renderFlag = () => {
		const emojiFlag = emojiFlags.countryCode(country?.code)
		const emoji = emojiFlag ? emojiFlag.emoji : DEFAULT_COUNTRY.emoji

		return (
			<TouchableOpacity
				style={styles.flagContainer}
				onPress={() => setIsCountrySelectorVisible(true)}
				disabled={!emoji}
			>
				<View pointerEvents="none">
					<Input
						value={emoji}
						rightIcon={<KyteIcon name="nav-arrow-down" color={colors.secondaryBg} size={10} />}
						rightIconStyle={{ position: 'absolute', right: 2, bottom: 20 }}
						editable={false}
					/>
				</View>
			</TouchableOpacity>
		)
	}

	const renderPhone = () => {
		const getMask = () => {
			const countryConfig = countriesWithMoreThanOneMak.find((c) => c.code === country?.code)

			if (countryConfig) {
				for (let i = 1; i <= countryConfig.numberOfMasks; i++) {
					if (i === countryConfig.numberOfMasks || value?.length <= countryConfig.limitCharToUseAnotherMask) {
						return countryPhoneMasks[`${country.code}${i}`]
					}
				}
			}

			return countryPhoneMasks[country?.code] || '999999999999999999999999999999999999'
		}

		return (
			<View style={styles.phoneContainer}>
				{isWhatsApp ? (
					<MaskedInput
						placeholder={placeholder}
						placeholderColor={colors.tipColor}
						value={value}
						onChangeText={(text) => setChangeText(text)}
						keyboardType="phone-pad"
						mask={getMask()}
						type="custom"
						maxLength={50}
						onBlur={onBlur}
						onFocus={() => {
							setDialCode()
							onFocus?.()
						}}
						error={error}
					/>
				) : (
					<Input
						placeholder={placeholder}
						placeholderColor={colors.primaryGrey}
						value={value}
						onChangeText={(text) => setChangeText(text)}
						keyboardType="phone-pad"
						type="custom"
						maxLength={50}
						onBlur={onBlur}
						onFocus={() => {
							setDialCode()
							onFocus?.()
						}}
						error={error}
					/>
				)}
				{infoText && (
					<KyteText marginTop={-6} size={11} color={colors.secondaryGrey} lineHeight={16.5}>
						{infoText}
					</KyteText>
				)}
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{renderFlag()}
			{renderPhone()}
			{isCountrySelectorVisible ? renderCountrySelector() : null}
		</View>
	)
}

const styles = {
	container: {
		flexDirection: 'row',
	},
	flagContainer: {
		width: 50,
		marginRight: 10,
	},
	phoneContainer: {
		flex: 1,
	},
}

const PhoneInput = connect(({ auth }) => ({ authStore: auth.store }))(PhoneInputComponent)
export { PhoneInput }
