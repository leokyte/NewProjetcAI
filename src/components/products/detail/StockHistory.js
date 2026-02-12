import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import _ from 'lodash'
import ProductListTile from '@kyteapp/kyte-ui-components/src/packages/products/product-list-tile/ProductListTile'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import { DetailPage, ConnectivityStatus, StockCircle } from '../../common'
import LoadingScreen from '../../common/LoadingScreen'
import StockItem from './StockItem'
import ProductImage from "../image/ProductImage"
import { listStyles, lineStyles, labelContainerDefaults, colors } from '../../../styles'
import { productGetStockHistory, saleFetchById, saleDetail } from '../../../stores/actions'
import { checkStockValueStatus, getVirtualCurrentStock } from '../../../util'
import I18n from '../../../i18n/i18n'

const PAGE_SIZE = 300
const CHUNK_SIZE = 30

const styles = StyleSheet.create({
	historyHeader: {
		borderBottomWidth: 15,
	},
	textCenter: {
		textAlign: 'center',
	},
})

class StockHistory extends Component {
	constructor(props) {
		super(props)

		this.state = {
			loading: true,
			isConnected: props.isOnline,
			movementList: null,
			stockHistoryChunks: null,
			movementListIndex: 0,
		}
	}

	UNSAFE_componentWillMount() {
		this.checkConnectivity()
	}

	getStockHistory() {
		const { product } = this.props
		this.productGetStockHistory(product.id, PAGE_SIZE).then(() => {
			this.setState({ loading: false })
		})
	}

	checkConnectivity() {
		const { isOnline } = this.props
		if (isOnline) {
			this.getStockHistory()
		}
	}

	goToStockFilter() {
		const { navigation, product } = this.props
		const { navigate } = navigation

		const checkIfFilterEnabled = (isFilterApplied) => {
			this.setState({
				...this.state,
				isFilterApplied,
			})
		}

		navigate('StockHistoryFilter', { checkIfFilterEnabled, product })
	}

	goToSaleDetail(saleID) {
		const { navigation } = this.props

		this.props.saleFetchById(saleID, (sale) => {
			this.props.saleDetail(sale)
			navigation.navigate('stockHistoryDetail', {
				refreshSales: this.getStockHistory.bind(this),
			})
		})
	}

	async fetchMoreStockHistoryItems(limit, newIndex) {
		const { product } = this.props
		const { movementList } = this.state

		const { data: result } = await this.productGetStockHistory(product.id, limit)

		if (!result.length) return

		const newStockHistoryChunks = _.chunk(result, CHUNK_SIZE)

		this.updateListState(newIndex, movementList, newStockHistoryChunks)
	}

	updateListState(newIndex, movementList, stockHistoryChunks) {
		this.setState({
			movementListIndex: newIndex,
			movementList: _.concat(movementList, stockHistoryChunks[newIndex]),
		})
	}

	handleListEndReached() {
		const { movementList, movementListIndex, stockHistoryChunks } = this.state
		const { stockHistoryTotal } = this.props

		const isThereMoreToFetch = () => (stockHistoryTotal > movementList.length)

		const newIndex = movementListIndex + 1

		const isListEnd = movementListIndex >= stockHistoryChunks.length - 1

		if (isListEnd) {
			if (!isThereMoreToFetch()) return

			const limit = PAGE_SIZE * newIndex
			return this.fetchMoreStockHistoryItems(limit, newIndex)
		}

		this.updateListState(newIndex, movementList, stockHistoryChunks)
	}

	productGetStockHistory(...params) {
		return this.props.productGetStockHistory(...params)
	}

	renderStockItem({ item }) {
		const { product } = this.props

		return <StockItem onPress={this.goToSaleDetail.bind(this)} isFractioned={product.isFractioned} stock={item} />
	}

	renderStockHistory() {
		const { stockHistory } = this.props
		const { isFilterApplied, movementList } = this.state

		const initializeMovementListState = () => {
			this.setState({
				movementListIndex: 0,
				movementList: stockHistoryChunks[0],
				stockHistoryChunks,
			})
		}

		const stockHistoryChunks = _.chunk(stockHistory, CHUNK_SIZE)

		if (stockHistory.length === 0) {
			return <View style={{ flex: 1 }}>{this.renderHistoryHeader()}</View>
		}

		if (!this.state.movementList) initializeMovementListState()

		return (
			<Container flex={1}>
				{this.renderHistoryHeader()}
				<FlatList
					initialNumToRender={9}
					style={{ backgroundColor: colors.white }}
					data={isFilterApplied ? stockHistory : movementList}
					keyExtractor={(item) => item._id.toString()}
					renderItem={this.renderStockItem.bind(this)}
					onEndReached={this.handleListEndReached.bind(this)}
					onEndReachedThreshold={3}
					getItemLayout={
						(data, index) => ({
							length: 80.4,
							offset: 80.4 * index,
							index,
						}) // length/offset must have the same height as StockItem
					}
				/>
			</Container>
		)
	}

	renderLoading() {
		return <LoadingScreen reverseColor hideLogo description={I18n.t('stockLoadingScreenDescription')} />
	}

	renderLabel(product) {
		return (
			<Text allowFontScaling={false} style={lineStyles.labelStyle}>
				{product.label}
			</Text>
		)
	}

	renderImage(product) {
		return <ProductImage style={lineStyles.flexImage} product={product} />
	}

	renderProductLabel(product) {
		const { labelContainer } = lineStyles
		return (
			<View style={[labelContainer, labelContainerDefaults(product.foreground)]}>
				{product?.stockActive ? this.renderStockCircle() : null}
				{product.image ? this.renderImage(product) : this.renderLabel(product)}
			</View>
		)
	}

	renderStockCircle() {
		const { product } = this.props
		const stockStatus = checkStockValueStatus(getVirtualCurrentStock(product), product.stock, product)

		if (stockStatus) {
			return <StockCircle status={stockStatus} coreStyle="listItem" />
		}
		
	}

	renderConnectivityInfo() {
		return (
			<ConnectivityStatus
				title={I18n.t('stockConnectivityStatusTitle')}
				info={I18n.t('stockConnectivityStatusInfo')}
				buttonIfo={I18n.t('stockConnectivityStatusButtonIfo')}
				onPress={this.checkConnectivity.bind(this)}
			/>
		)
	}

	renderProductImage(product) {
		return (
			<ProductImage
				product={product}
				style={{
					width: "100%",
					height: "100%",
					borderRadius: 4,
				}}
				resizeMode="cover"
			/>
		)
	}

	renderHistoryHeader() {
		const { product, currency, parentProduct } = this.props
		const { textCenter, historyHeader } = styles
		const { itemContainer, cornerContainer, infoContainer, itemTitle, itemInfo } = listStyles
		return (
			<Margin bottom={16}>
				<Container backgroundColor={colors.white}>
					<Padding vertical={16}>
						<ProductListTile
							product={{
								...product,
								image: parentProduct?.image
							}}
							currency={currency}
							texts={{ andSeparator: ', ', total: I18n.t('stockMinimum') }}
							isStockInfoVisible
							renderImageComponent={() => this.renderProductImage(parentProduct)}
              renderWrapper={(content) => content}
						/>
					</Padding>
				</Container>
			</Margin>
		)
	}

	rightButtons() {
		return [
			{
				icon: 'filter',
				color: this.state.isFilterApplied ? colors.actionColor : colors.secondaryBg,
				onPress: () => this.goToStockFilter(),
				iconSize: 20,
			},
		]
	}

	render() {
		const { loading, isConnected, rightButtons } = this.state
		const { goBack } = this.props.navigation
		const renderContent = !loading ? this.renderStockHistory() : this.renderLoading()

		return (
			<DetailPage
				goBack={goBack}
				style={{ backgroundColor: colors.lightBg }}
				pageTitle={I18n.t('words.p.movimentations')}
				rightButtons={this.rightButtons()}
			>
				{isConnected ? renderContent : this.renderConnectivityInfo()}
			</DetailPage>
		)
	}
}

const mapStateToProps = ({ products, common, preference }, ownProps) => {
	const product = ownProps?.route?.params?.product ?? products?.detail
	const { stockHistory, stockHistoryTotal } = products

	return {
		product,
		parentProduct: products?.detail,
		stockHistory,
		stockHistoryTotal,
		isOnline: common.isOnline,
		currency: preference.account.currency,
	}
}

export default connect(mapStateToProps, {
	productGetStockHistory,
	saleFetchById,
	saleDetail,
})(StockHistory)
