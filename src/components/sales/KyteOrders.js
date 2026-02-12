import React, { useState, useEffect, useCallback } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
	syncDownRestore,
	fetchLocalSales,
	fetchServerSales,
	syncSales,
	salesUpdateListItem,
	setIsCancellingSale,
} from '../../stores/actions'
import { useGetSyncResult } from '../../hooks'
import SaleItem from './SaleItem'
import { SalesFetchTypeEnum, SalesSortEnum, SalesTypeEnum } from '../../enums/SaleSort'
import { colors } from '../../styles'
import SalesFetchErrorMessage from './auxiliary-components/SalesFetchErrorMessage'

const KyteOrders = ({
	onItemPress,
	endReachedThreshold,
	emptyComponent,
	list,
	filterOrders,
	listSize,
	currency,
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
	unsycedOrders,
	...props
}) => {
	const [isFetching, setIsFetching] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(true)
	const { hasOpenedSales } = useGetSyncResult(syncDownResult)
	const isLocal = salesFetchType === SalesFetchTypeEnum.LOCAL
	const listStyle = { flex: 1 }

	const handleFetch = useCallback(({ lastId, reboot = false, successCallback = null, length = 0 }) => {
		setIsRefreshing(true)
		fetchServer({
			type: SalesTypeEnum.ORDER,
			defaultStatus: ['all'],
			reboot,
			successCallback: () => {
				setIsRefreshing(false)
				successCallback?.()
			},
			lastId,
			customerId,
			userId,
			sort: SalesSortEnum.DESC_DATE_CREATION,
			errorCallback: () =>
				fetchLocal({
					length,
					successCallback: () => {
						setIsRefreshing(false)
						successCallback?.()
					},
					reboot,
					type: SalesTypeEnum.ORDER,
				}),
		})
	}, [])

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
		if (unsycedOrders?.length) props.syncSales(unsycedOrders, SalesTypeEnum.ORDER)
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
					salesType="order"
					isSyncing={Boolean(syncingSalesMap[item.sale.id])}
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
		handleFetch({ length: 0, reboot: true, successCallback: () => setIsFetching(false) })
	}, [filterOrders, handleFetch])

	useEffect(() => {
		const { syncUpdatedDocument: updatedSale } = syncDownResult
		if (hasOpenedSales) {
			props.salesUpdateListItem({ salesType: SalesTypeEnum.ORDER, updatedSale, salesList: list })
			props.syncDownRestore()
		}
	}, [hasOpenedSales])

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

const mapStateToProps = ({ sales, preference, sync, common }) => ({
	list: sales.ordersGroupsResult.list,
	filterOrders: sales.filterOrders,
	listSize: sales.listSize,
	fetchLimit: sales.fetchLimit,
	salesFetchType: sales.salesFetchType,
	currency: preference.account.currency,
	syncDownResult: sync.syncDownResult,
	isOnline: common.isOnline,
	isCancellingSale: common.isCancellingSale,
	syncingSalesMap: sync.syncingSalesMap,
	unsycedOrders: sales.ordersGroupsResult.unsycedList,
})

const mapDispatchToProps = (dispatch) => ({
	...bindActionCreators(
		{
			fetchLocalSales,
			fetchServerSales,
			syncDownRestore,
			setIsCancellingSale,
			syncSales,
			salesUpdateListItem,
		},
		dispatch
	),
})

export default connect(mapStateToProps, mapDispatchToProps)(KyteOrders)
