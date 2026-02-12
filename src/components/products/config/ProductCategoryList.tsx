import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Alert, FlatList, InteractionManager } from 'react-native'
import { connect } from 'react-redux'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'

import {
	checkUserReachedLimit,
	productCategoryDetailCreate,
	productCategoryDetailUpdate,
	productCategoryFetch,
	productCategoryFetchByName,
	productCategorySave,
	productCategoryReorder,
} from '../../../stores/actions'

import I18n from '../../../i18n/i18n'

import { logEvent } from '../../../integrations'
import { checkUserPermission } from '../../../util'
import NavigationService from '../../../services/kyte-navigation'
import {
	CustomKeyboardAvoidingView,
	DetailPage,
	EmptyContent,
	KyteIcon,
	SearchBar,
	SubHeaderButton,
} from '../../common'
import { colors } from '../../../styles'
import ProductCategoryItemList from './ProductCategoryItem'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'

type ConfigRootStackParamList = {
	ProductCategoryList: RouteParams
	ProductCategoryCreate: undefined
}

type ProductCategoryListRouteProp = RouteProp<ConfigRootStackParamList, 'ProductCategoryList'>

interface ProductCategoryItem {
	id: string | null
	name: string
	order?: number
	clone?: () => ProductCategoryItem
}

interface User {
	permissions: any
}

interface RouteParams {
	origin?: string
	onItemPress?: (category: ProductCategoryItem) => void
	onAddPress?: () => void
	disableDraggable?: boolean
}

interface RootState {
	productCategory: {
		list: ProductCategoryItem[]
	}
	auth: {
		user: User
	}
	common: {
		userHasReachedLimit: boolean
	}
}

interface RenderItemProps {
	item: ProductCategoryItem
	drag: () => void
	isActive: boolean
	index: number
}

interface ProductCategoryListProps {
	productCategory: ProductCategoryItem[]
	user: User
	userHasReachedLimit: boolean

	checkUserReachedLimit: () => void
	productCategoryDetailCreate: () => void
	productCategoryDetailUpdate: (category: ProductCategoryItem) => void
	productCategoryFetch: (value?: any, callback?: (data: ProductCategoryItem[]) => void) => void
	productCategoryFetchByName: (name: string) => void
	productCategorySave: (category: ProductCategoryItem) => void
	productCategoryReorder: (categories: ProductCategoryItem[]) => Promise<void>
}

const STRINGS = {
	PAGE_TITLE: I18n.t('productsTabCategoriesLabel'),
}

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
		borderRadius: 4,
	},
}

const ProductCategoryList: React.FC<ProductCategoryListProps> = ({
	productCategory,
	user,
	userHasReachedLimit,
	checkUserReachedLimit,
	productCategoryDetailCreate,
	productCategoryDetailUpdate,
	productCategoryFetch,
	productCategoryFetchByName,
	productCategoryReorder,
}) => {
	const [hasCategories, setHasCategories] = useState(false)
	const [didFinishInitialAnimation, setDidFinishInitialAnimation] = useState(false)
	const [allCategories, setAllCategories] = useState<Map<string, ProductCategoryItem>>(new Map())
	const [isSearchBarVisible, setIsSearchBarVisible] = useState(false)
	const route = useRoute<ProductCategoryListRouteProp>()
	const navigation = useNavigation()

	const { origin, onItemPress, onAddPress, disableDraggable } = route.params || {}

	useEffect(() => {
		logEvent('Product Category List View')
		productCategoryFetch(null, (data: ProductCategoryItem[]) => {
			const categoriesMap = new Map<string, ProductCategoryItem>()
			for (const category of productCategory) {
				categoriesMap.set(category.name, category)
			}
			setAllCategories(categoriesMap)
			setHasCategories(!!data.length)
		})

		InteractionManager.runAfterInteractions(() => {
			setDidFinishInitialAnimation(true)
		})
	}, [])

	useEffect(() => {
		setHasCategories(!!productCategory.length)
	}, [productCategory])

	const goToProductCategory = useCallback(
		(productCategoryItem: ProductCategoryItem) => {
			const { permissions } = user

			if (checkUserPermission(permissions).allowProductsRegister) {
				if (origin && origin === 'ProductDetail') {
					onItemPress?.(productCategoryItem)
				} else {
					productCategoryDetailUpdate(productCategoryItem)
					navigation.navigate('ProductCategoryCreate')
				}
				return
			}

			Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
		},
		[user, origin, onItemPress, navigation, productCategoryDetailUpdate]
	)

	const toggleSearch = useCallback(() => {
		setIsSearchBarVisible((prev) => !prev)
	}, [])

	const closeSearch = useCallback(() => {
		setIsSearchBarVisible(false)
		searchCategoriesByName('')
	}, [])

	const searchCategoriesByName = useCallback(
		(text: string) => {
			productCategoryFetchByName(text)
		},
		[productCategoryFetchByName]
	)

	const openProductCategoryCreate = useCallback(() => {
		const { permissions } = user

		checkUserReachedLimit()
		if (userHasReachedLimit) {
			NavigationService.reset('Confirmation', 'SendCode', {
				origin: 'user-blocked',
				previousScreen: 'Products',
			})

			logEvent('UserReachedLimit', user)
			return
		}

		if (checkUserPermission(permissions).allowProductsRegister) {
			productCategoryDetailCreate()

			if (origin === 'ProductDetail' && onAddPress) {
				return onAddPress()
			}
			navigation.navigate('ProductCategoryCreate')
			return
		}

		Alert.alert(I18n.t('words.s.attention'), I18n.t('userNotAllowedToManageProducts'))
	}, [user, userHasReachedLimit, origin, onAddPress, navigation, checkUserReachedLimit, productCategoryDetailCreate])

	const updateCategoryOrder = useCallback(
		async (newOrder: ProductCategoryItem[]) => {
			const updatedCategories: ProductCategoryItem[] = []
			let index = 0

			for (const _category of newOrder) {
				const existingCategory = allCategories.get(_category.name)
				if (existingCategory && index !== existingCategory.order) {
					allCategories.delete(_category.name)

					let category: ProductCategoryItem
					try {
						category = _category.clone?.() || _category
					} catch (ex) {
						category = _category
					}

					const updatedCategory = { ...category, order: index }
					allCategories.set(category.name, updatedCategory)
					updatedCategories.push(updatedCategory)
				}
				index++
			}

			await productCategoryReorder(updatedCategories)
			productCategoryFetch()
		},
		[allCategories, productCategoryReorder, productCategoryFetch]
	)

	const renderPlusButton = (onPress: () => void) => (
		<Container style={styles.plusButtonWrapper}>
			<SubHeaderButton onPress={onPress} style={styles.plusButtonContainer}>
				<KyteIcon name="plus-calculator" color={colors.white} size={16} />
			</SubHeaderButton>
		</Container>
	)

	const renderItem = useCallback(
		({ item, drag, isActive, index }: RenderItemProps) => {
			return (
				<ProductCategoryItemList
					key={index}
					onPress={() => goToProductCategory(item)}
					productCategory={item}
					disabled={isActive}
					onLongPress={!disableDraggable ? drag : undefined}
					isActive={!disableDraggable ? isActive : undefined}
					{...({} as any)}
				/>
			)
		},
		[disableDraggable, goToProductCategory]
	)

	const renderEmptyContent = useCallback(() => {
		return <EmptyContent onPress={openProductCategoryCreate} text={I18n.t('firstItemCategoryHelper')} />
	}, [openProductCategoryCreate])

	const renderSearchBar = useCallback(() => {
		return (
			<SearchBar
				isOpened={isSearchBarVisible}
				openedPlaceholder={I18n.t('productCategorySearchPlaceholderActive')}
				closedPlaceholder={I18n.t('productCategorySearchPlaceholder')}
				toggleSearch={toggleSearch}
				closeSearchAction={closeSearch}
				searchAction={searchCategoriesByName}
				// plusAction={origin === 'ProductDetail' ? undefined : openProductCategoryCreate}
			/>
		)
	}, [isSearchBarVisible, origin, toggleSearch, closeSearch, searchCategoriesByName, openProductCategoryCreate])

	const finalProductCategory = useMemo(() => {
		return origin === 'ProductDetail'
			? [{ name: I18n.t('productCategoryWithoutCategory'), id: null } as ProductCategoryItem].concat(productCategory)
			: productCategory
	}, [origin, productCategory])

	const extractKey = useCallback((_: any, index: number) => `draggable-item-${index}`, [])

	const handleDragEnd = useCallback(
		({ data }: { data: ProductCategoryItem[] }) => {
			updateCategoryOrder(data)
		},
		[updateCategoryOrder]
	)

	const itemLayout = useCallback(
		(_: any, index: number) => ({
			length: 392.7,
			offset: 65.5 * index,
			index,
		}),
		[]
	)

	const renderContent = useCallback(() => {
		const renderDraggable = () => {
			return (
				didFinishInitialAnimation && (
					<DraggableFlatList
						containerStyle={styles.DraggableListStyle}
						data={finalProductCategory}
						renderItem={renderItem}
						keyExtractor={extractKey}
						onDragEnd={handleDragEnd}
						maxToRenderPerBatch={30}
						initialNumToRender={12}
						updateCellsBatchingPeriod={70}
						windowSize={31}
						getItemLayout={itemLayout}
						autoscrollSpeed={10}
						{...({} as any)}
					/>
				)
			)
		}

		const renderFlat = () => {
			return (
				<FlatList
					data={finalProductCategory}
					renderItem={renderItem}
					keyExtractor={(_, i) => i.toString()}
					{...({} as any)}
				/>
			)
		}

		return (
			<Container flex={1}>
				{renderSearchBar()}
				{origin === 'ProductDetail' ? renderFlat() : renderDraggable()}
			</Container>
		)
	}, [
		didFinishInitialAnimation,
		finalProductCategory,
		renderItem,
		extractKey,
		handleDragEnd,
		itemLayout,
		renderSearchBar,
		origin,
	])

	const handleGoBack = () => {
		navigation.reset({
			index: 0,
			routes: [{ name: 'ProductConfigPage' }],
		})
	}

	return (
		<DetailPage
			pageTitle={STRINGS.PAGE_TITLE}
			goBack={() => handleGoBack()}
			rightComponent={renderPlusButton(openProductCategoryCreate)}
		>
			<CustomKeyboardAvoidingView style={{ flex: 1 }}>
					{hasCategories ? renderContent() : renderEmptyContent()}
			</CustomKeyboardAvoidingView>
		</DetailPage>
	)
}

const mapStateToProps = (state: RootState) => ({
	productCategory: state.productCategory.list,
	user: state.auth.user,
	userHasReachedLimit: state.common.userHasReachedLimit,
})

const mapDispatchToProps = {
	checkUserReachedLimit,
	productCategoryDetailCreate,
	productCategoryDetailUpdate,
	productCategoryFetch,
	productCategoryFetchByName,
	productCategorySave,
	productCategoryReorder,
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(ProductCategoryList)
