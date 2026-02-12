import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import VariantsCreationSetup from '../../components/products/variants/wizard/VariantsCreationSetup'
import VariantCreate from '../../components/products/variants/wizard/VariantCreate'
import VariantOptionsCreate from '../../components/products/variants/wizard/VariantOptionsCreate'
import VariantChooseMain from '../../components/products/variants/wizard/VariantChooseMain'
import VariantsList from '../../components/products/variants/wizard/VariantsList'
import CatalogVersion from '../../components/config/catalog/CatalogVersion'
import ProductVariantTips from '../../components/products/variants/wizard/ProductVariantTips'
import { VariantsScreens } from '../../enums/Screens'

const Stack = createStackNavigator()
const screenOptions = { headerShown: false }

const VariantsWizard: React.FC = () => (
	<Stack.Navigator initialRouteName={VariantsScreens.VariantsCreationSetup} screenOptions={screenOptions}>
		<Stack.Screen name={VariantsScreens.VariantsCreationSetup} component={VariantsCreationSetup} />
		<Stack.Screen name={VariantsScreens.VariantCreate} component={VariantCreate} />
		<Stack.Screen name={VariantsScreens.VariantOptionsCreate} component={VariantOptionsCreate} />
		<Stack.Screen name={VariantsScreens.VariantsList} component={VariantsList} />
		<Stack.Screen name={VariantsScreens.VariantChooseMain} component={VariantChooseMain} />
		<Stack.Screen name={VariantsScreens.VariantOptionsEdit} component={VariantOptionsCreate} />
		<Stack.Screen name={VariantsScreens.CatalogVersion} component={CatalogVersion} />
		<Stack.Screen name={VariantsScreens.ProductVariantTips} component={ProductVariantTips} />
	</Stack.Navigator>
)

export default VariantsWizard
