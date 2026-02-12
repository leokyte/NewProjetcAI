import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import ProductStock from '../../components/products/detail/ProductStock'
import { DetailPage } from '../../components/common'
import { getVariantName } from '../../util/products/util-variants'
import CurrentStockManager from '../../components/products/detail/CurrentStockManager'
import MinimumStockManager from '../../components/products/detail/MinimumStockManager'
import StockHistory from '../../components/products/detail/StockHistory'
import VariantStockDetailScreen from '../../components/products/detail/VariantStockDetail'
import { IProductWithVariation } from '@kyteapp/kyte-utils'
import { buildProductManaging } from '../../util'
import { RouteProp } from '@react-navigation/native'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

type RouteProps = { product: IProductWithVariation; productManaging: ReturnType<typeof buildProductManaging> }
type VariantStockDetailScreenProps = {
	route: RouteProp<{ params: RouteProps }, 'params'>
}

const VariantStockDetail: React.FC<VariantStockDetailScreenProps> = ({ route }) => {
	const { product } = route?.params ?? {}

	return (
		<Stack.Navigator initialRouteName="ProductStock" screenOptions={screenOptions}>
			<Stack.Screen name="ProductStock" component={VariantStockDetailScreen} />
			<Stack.Screen name="CurrentStockManager" component={CurrentStockManager} initialParams={{ product }} />
			<Stack.Screen name="MinimumStockManager" component={MinimumStockManager} initialParams={{ product }} />
			<Stack.Screen name="StockHistory" component={StockHistory} initialParams={{ product }} />
		</Stack.Navigator>
	)
}

export default VariantStockDetail
