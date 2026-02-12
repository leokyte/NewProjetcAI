import React, { useState, useEffect, useCallback } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { connect } from 'react-redux'

import { fetchLocalSales, fetchServerSales, syncSales, salesUpdateListItem, setIsCancellingSale } from '../../stores/actions'
import { useGetSyncResult } from '../../hooks'
import SaleItem from './SaleItem'
import { colors } from '../../styles'
import { Period } from '../../enums'
import { SalesFetchTypeEnum, SalesSortEnum, SalesTypeEnum } from '../../enums/SaleSort'
import { syncDownRestore } from '../../stores/actions/SyncActions'
import SalesFetchErrorMessage from './auxiliary-components/SalesFetchErrorMessage'

const KyteSales = ({
	endReachedThreshold,
	emptyComponent,
	onItemPress,
	list,
	filterSales,
	listSize,
	currency,
	isAtCustomerDetail,
	syncDownResult,
	isOnline,
	fetchLimit,
	customerId,
	userId,
	salesFetchType,
	fetchLocalSales: fetchLocal,
	fetchServerSales: fetchServer,
	isLoading,
	isCancellingSale,
	syncingSalesMap,
	unsycedSales,
	...props
}) => {
	const [isFetching, setIsFetching] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(true)
	const { hasClosedSales } = useGetSyncResult(syncDownResult)
	const isLocal = salesFetchType === SalesFetchTypeEnum.LOCAL
	const listStyle = { flex: 1 }

	const handleFetch = useCallback(
		({ lastId, reboot = false, successCallback = null, length = 0, period = Period.LAST_30_DAYS }) => {
			setIsRefreshing(true)
			fetchServer({
				type: SalesTypeEnum.SALE,
				defaultStatus: ['closed'],
				reboot,
				successCallback: () => {
					setIsRefreshing(false)
					successCallback?.()
				},
				lastId,
				period,
				customerId,
				userId,
				sort: SalesSortEnum.DESC_DATE_CLOSED,
				errorCallback: () =>
					fetchLocal({
						length,
						successCallback: () => {
							setIsRefreshing(false)
							successCallback?.()
						},
						reboot,
						type: SalesTypeEnum.SALE,
					}),
			})
		},
		[]
	)

	const handleOnEndReached = () => {
		if (listSize !== fetchLimit || isRefreshing) return
		const lastId = list[list.length - 1]?.sale?.id

		handleFetch({
			lastId,
			reboot: false,
			length: list.length,
		})
	}

	const handlePullToUpdate = () => {
		if (unsycedSales?.length) props.syncSales(unsycedSales, SalesTypeEnum.SALE)
		handleFetch({ length: 0, reboot: true })
	}

	const renderItem = useCallback(
		(sale) => {
			const { item } = sale

			return (
				<SaleItem
					sale={item.sale}
					dailyTotal={item.dailyTotal}
					isLast={item.isLast}
					currency={currency}
					onPress={() => onItemPress(item)}
					salesType="sale"
					isSyncing={syncingSalesMap[item.sale.id]}
				/>
			)
		},
		[syncingSalesMap]
	)

	const renderFetchLoading = (isFooter = false) => {
		const containerHeight = isFooter ? { height: 60 } : { flex: 1 }
		const container = { ...containerHeight, justifyContent: 'center', alignItems: 'center' }
		return (
			<View style={container}>
				<ActivityIndicator size={isFooter ? 'small' : 'large'} color={colors.actionColor} />
			</View>
		)
	}

	const setWarning = () => isLocal && !isRefreshing && isOnline

	useEffect(() => {
		setIsFetching(true)
		handleFetch({
			length: 0,
			reboot: true,
			successCallback: () => setIsFetching(false),
		})
	}, [filterSales, handleFetch])

	useEffect(() => {
		const { syncUpdatedDocument: updatedSale } = syncDownResult

		if (hasClosedSales) {
			props.salesUpdateListItem({ salesType: SalesTypeEnum.SALE, updatedSale, salesList: list })
			props.syncDownRestore()
		}
	}, [hasClosedSales])

	useEffect(() => {
		isLoading?.(isFetching || isRefreshing)
	}, [isFetching, isRefreshing])

	useEffect(() => {
		if (isCancellingSale) {
			handleFetch({ length: 0, reboot: true, successCallback: () => props.setIsCancellingSale(false) })
		}
	}, [isCancellingSale])

	return isFetching ? (
		renderFetchLoading()
	) : (
		<>
			<FlatList
				data={list}
				key={salesFetchType}
				keyExtractor={(item, i) => `${item.id}-${i}`}
				renderItem={renderItem}
				removeClippedSubviews
				initialNumToRender={16}
				onEndReachedThreshold={endReachedThreshold || 1.5}
				ListFooterComponent={isRefreshing ? renderFetchLoading(true) : null}
				ListEmptyComponent={emptyComponent}
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handlePullToUpdate} />}
				onEndReached={handleOnEndReached}
				contentContainerStyle={list.length <= 0 ? listStyle : null}
				refreshing={isRefreshing}
			/>
			<SalesFetchErrorMessage showWarning={setWarning()} />
		</>
	)
}

const mapStateToProps = ({ sales, preference, common, sync }) => ({
	list: sales.salesGroupsResult.list,
	filterSales: sales.filterSales,
	listSize: sales.listSize,
	fetchLimit: sales.fetchLimit,
	salesFetchType: sales.salesFetchType,
	currency: preference.account.currency,
	isAtCustomerDetail: common.actualRouteName === 'CustomerDetail' || common.actualRouteName === 'UserEdit',
	syncDownResult: sync.syncDownResult,
	isOnline: common.isOnline,
	isCancellingSale: common.isCancellingSale,
	syncingSalesMap: sync.syncingSalesMap,
	unsycedSales: sales.salesGroupsResult.unsycedList,
})

export default connect(mapStateToProps, {
	fetchLocalSales,
	fetchServerSales,
	syncDownRestore,
	salesUpdateListItem,
	syncSales,
	setIsCancellingSale
})(KyteSales)
