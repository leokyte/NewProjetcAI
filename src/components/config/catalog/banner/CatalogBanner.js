import React, { useState } from 'react'
import { connect } from 'react-redux'
import { KyteBox, KyteButtonV2 } from '@kyteapp/kyte-ui-components'
import { DetailPage, LoadingCleanScreen, KyteUploadPhoto } from '../../../common'
import I18n from '../../../../i18n/i18n'
import { EditPage, InitialPage, ModalTip } from './parts'
import { kyteAccountSetImageBanner, kyteAccountDeleteImageBanner } from '../../../../services'
import { storeAccountSave } from '../../../../stores/actions'
import { generateTestID } from '../../../../util'
import { logEvent } from '../../../../integrations'

const CatalogBanner = ({ navigation, billing, auth, ...props }) => {
	const { store, aid } = auth
	const catalogBanner = store?.catalog?.banner
		? {
				URL: store.catalog.banner.URL,
				active: store.catalog.banner.active,
		  }
		: {}

	const [currentBanner, setCurrentBanner] = useState({
		URL: catalogBanner.URL,
		filepath: catalogBanner.filepath,
		active: catalogBanner.active,
	})
	const [isLoading, setIsLoading] = useState(false)
	const [showModalPhoto, setShowModalPhoto] = useState(false)
	const [showModalInfo, setShowModalInfo] = useState(false)
	const storeInfo = { aid, _id: store?._id }

	const saveBanner = async () => {
		setIsLoading(true)

		try {
			const accountSetImageBanner = await kyteAccountSetImageBanner(
				storeInfo,
				currentBanner.filepath,
				currentBanner.active,
				catalogBanner
			)

			props.storeAccountSave({
				...store,
				catalog: {
					...store.catalog,
					banner: accountSetImageBanner,
				},
			})

			logEvent(catalogBanner?.URL ? 'BannerSave' : 'BannerCreate')
		} catch (error) {
			if (__DEV__) {
				console.tron.logImportant('saveBanner', { message: error.message })
			}
		} finally {
			setIsLoading(false)
			navigation.goBack()
		}
	}

	const removePhoto = async () => {
		if (!currentBanner.URL) {
			setCurrentBanner({
				URL: '',
				filepath: '',
				active: false,
			})

			return
		}

		try {
			setIsLoading(true)
			await kyteAccountDeleteImageBanner(storeInfo)

			const updatedCatalog = { ...store.catalog }
			delete updatedCatalog.banner

			props.storeAccountSave({ ...store, catalog: updatedCatalog })
			logEvent('BannerRemove')
		} catch (error) {
			if (__DEV__) {
				console.tron.logImportant('removePhoto', { message: error.message })
			}
		} finally {
			setIsLoading(false)
			navigation.goBack()
		}
	}

	return (
		<DetailPage
			pageTitle={I18n.t('catalog.banner.title')}
			goBack={() => navigation.goBack()}
			rightComponent={
				Boolean(currentBanner.URL) && (
					<KyteBox mr={5}>
						<KyteButtonV2
							onPress={() => setShowModalInfo(true)}
							startIcon="help"
							circle
							size="xs"
							iconSize={18}
							type="blank"
							testProps={generateTestID('help-ea')}
						/>
					</KyteBox>
				)
			}
		>
			{currentBanner.URL || currentBanner.filepath ? (
				<EditPage
					showModal={() => setShowModalPhoto(true)}
					bannerDoc={currentBanner}
					initialBanner={catalogBanner}
					toggleBanner={() => setCurrentBanner({ ...currentBanner, active: !currentBanner.active })}
					remove={removePhoto}
					saveBanner={saveBanner}
				/>
			) : (
				<InitialPage showModal={() => setShowModalPhoto(true)} billing={billing} />
			)}

			<KyteUploadPhoto
				isVisible={showModalPhoto}
				crop={{ width: 1136, height: 284 }}
				setShowModalPhoto={setShowModalPhoto}
				setBannerPhoto={(imgPath) => {
					setCurrentBanner({ ...currentBanner, filepath: imgPath, active: true })
				}}
			/>

			<ModalTip isVisible={showModalInfo} closeModal={() => setShowModalInfo(false)} />

			{isLoading && <LoadingCleanScreen />}
		</DetailPage>
	)
}

const mapStateToProps = ({ billing, auth }) => ({
	billing,
	auth,
})

export default connect(mapStateToProps, { storeAccountSave })(CatalogBanner)
