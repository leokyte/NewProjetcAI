import IconButton from '@kyteapp/kyte-ui-components/src/packages/buttons/icon-button/IconButton'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import ListTile from '@kyteapp/kyte-ui-components/src/packages/lists/_list-tile/ListTile'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList } from 'react-native'
import { connect } from 'react-redux'
import VariantsExampleCompletedIllustration from '../../../../../assets/images/variants/variants-example-completed'
import I18n from '../../../../i18n/i18n'
import { getVariations } from '../../../../stores/variants/actions/wizard-variation.async.actions'
import { IVariant, SET_VARIANTS_NOTIFICATIONS } from '../../../../stores/variants/variants.types'
import { RootState } from '../../../../types/state/RootState'
import { LoadingCleanScreen, SubHeaderButton, DetailPage } from '../../../common'
import EmptyState from '../../../common/EmptyState'
import KyteNotifications from '../../../common/KyteNotifications'
import { setVariationDetail } from '../../../../stores/variants/actions/product-variant.actions'

const Strings = {
	t_title: I18n.t('variantsList.title'),
	t_error_notification_title: I18n.t('variants.apiGetVariationsListError'),
	t_error_notification_description: 'Você pode tentar novamente',
	t_empty_state_title: I18n.t('variationsManager.emptyState.title'),
	t_empty_state_description: I18n.t('variationsManager.emptyState.description'),
	t_empty_state_btn: I18n.t('createNewVariant'),
	t_search_placeholder: I18n.t('productCategorySearchPlaceholder'),
}

type OwnProps = {}
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof dispatchablePropsMap

import { SearchBar } from '../../../common/SearchBar'
import colorsKyte from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import { colors } from '../../../../styles'

const VariationsManager: React.FC<Props> = ({ aid, variations, isLoading, globalNotifications, ...props }) => {
	const navigation = useNavigation()
	const route = useRoute()
	const [notifications, setNotifications] = useState<KyteNotificationProps[]>([])
	const [search, setSearch] = useState('')
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [filteredVariations, setFilteredVariations] = useState<IVariant[]>(variations || [])

	const allNotifications = [...notifications, ...globalNotifications]
	const shouldRenderEmptyState = filteredVariations?.length === 0 && allNotifications?.length === 0 && !isLoading

	const fetchVariations = useCallback(() => {
		const markError = (error?: any) => {
			if (error) {
				const errorNotification: KyteNotificationProps = {
					title: Strings.t_error_notification_title,
					type: NotificationType.ERROR,
					subtitle: Strings.t_error_notification_description,
					shouldHideCloseBtn: true,
					rightElement: (
						<IconButton
							name="refresh"
							onPress={() => {
								setNotifications(notifications.slice(1))
								fetchVariations()
							}}
						/>
					),
				}
				setNotifications([...notifications, errorNotification])
			}
		}
		props.getVariations?.(aid, markError, true)
	}, [])

	const onPressEmptyStateBtn = useCallback(() => {
		navigation.navigate('VariationCreatePage')
	}, [])

	useEffect(() => {
		fetchVariations()

		props.clearGlobalNotifications()

		return () => {
			props.clearGlobalNotifications()
		}
	}, [])

	useEffect(() => {
		const params = route.params as any
		if (params?.successNotification) {
			setNotifications((current) => [...current, params.successNotification])
			navigation.setParams({ successNotification: undefined })
		}
	}, [route.params])

	useEffect(() => {
		if (!search) {
			setFilteredVariations(variations || [])
		} else {
			const term = search.toLowerCase()
			setFilteredVariations((variations || []).filter((v) => v.name?.toLowerCase().includes(term)))
		}
	}, [search, variations])

	const renderPlusButton = (onPress: () => void) => (
		<Container style={styles.plusButtonWrapper}>
			<SubHeaderButton onPress={onPress} style={styles.plusButtonContainer}>
				<KyteIcon name="plus-calculator" color={colors.white} size={12} />
			</SubHeaderButton>
		</Container>
	)

	const handleNavigateToVariationCreate = useCallback(() => {
		navigation.navigate('VariationCreatePage')
	}, [])

	const renderItem = useCallback(
		({ item }: { item: IVariant }) => (
			<ListTile
				title={{ text: item.name }}
				paddingVertical={16}
				rightContent={<KyteIcon name="nav-arrow-right" size={14} />}
				height={26}
				onPress={() => {
					props?.setVariationDetail(item)
					navigation.navigate('VariationEditPage')
				}}
			/>
		),
		[navigation]
	)

	const toggleSearchBarVisibility = () => {
		setSearch('')
		if (isSearchOpen) setFilteredVariations(variations)
		setIsSearchOpen((flag) => !flag)
	}

	return (
		<DetailPage
			pageTitle={Strings.t_title}
			goBack={navigation.goBack}
			rightComponent={renderPlusButton(() => handleNavigateToVariationCreate())}
		>
			{isLoading && <LoadingCleanScreen />}
			<KyteNotifications notifications={allNotifications} />
			<Container flex={1}>
				<SearchBar
					isOpened={isSearchOpen}
					searchAction={setSearch}
					toggleSearch={toggleSearchBarVisibility}
					closeSearchAction={toggleSearchBarVisibility}
					closedPlaceholder={Strings.t_search_placeholder}
					openedPlaceholder={Strings.t_search_placeholder}
					style={{ backgroundColor: '#F7F7F7', borderBottomWidth: 1, borderBottomColor: '#ECECEC' }}
				/>
				{filteredVariations?.length !== 0 && (
					<FlatList keyExtractor={(_item, index) => String(index)} renderItem={renderItem} data={filteredVariations} />
				)}
				{shouldRenderEmptyState && (
					<Container flex={1}>
						<Container flex={1} justifyContent="center" backgroundColor={colorsKyte.gray10}>
							<EmptyState
								strings={{
									title: Strings.t_empty_state_title,
									description: [Strings.t_empty_state_description],
								}}
								image={{ source: { uri: VariantsExampleCompletedIllustration }, style: { width: 200, height: 200 } }}
							/>
						</Container>
						<Container flex={0} backgroundColor={colors.white}>
							<Padding all={16}>
								<KyteButton
									textStyle={{ fontSize: 16, lineHeight: 24, fontWeight: '500' }}
									onPress={onPressEmptyStateBtn}
									type="primary"
								>
									{Strings.t_empty_state_btn}
								</KyteButton>
							</Padding>
						</Container>
					</Container>
				)}
			</Container>
		</DetailPage>
	)
}

function mapStateToProps(state: RootState) {
	return {
		aid: state.auth.aid as string,
		variations: (state.variants?.list as IVariant[]) || [],
		isLoading: Boolean(state.variants.isFetchingList),
		globalNotifications: state.variants?.notifications || [],
	}
}

const clearGlobalNotifications = () => ({
	type: SET_VARIANTS_NOTIFICATIONS,
	payload: [],
})

const dispatchablePropsMap = { getVariations, setVariationDetail, clearGlobalNotifications }

const styles = {
	DraggableListStyle: {
		flex: 1,
	},
	plusButtonWrapper: {
		paddingRight: 8,
	},
	plusButtonContainer: {
		backgroundColor: colors.actionColor,
		height: 36,
		width: 36,
		borderRadius: 8,
	},
}

export default connect(mapStateToProps, dispatchablePropsMap)(VariationsManager)
