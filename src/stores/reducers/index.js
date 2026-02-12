import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'

import CurrentSaleReducer from './CurrentSaleReducer'
import LsstaleReducer from './LastSaleReducer'
import SaleReducer from './SalesReducer'
import ProductsReducer from './ProductsReducer'
import CustomersReducer from './CustomersReducer'
import PaymentTypesReducer from './PaymentTypesReducer'
import CommonReducer from './CommonReducer'
import AuthReducer from './AuthReducer'
import SyncReducer from './SyncReducer'
import StoreReducer from './StoreReducer'
import ExternalPaymentsReducer from './ExternalPaymentsReducer'
import PreferenceReducer from './PreferenceReducer'
import PrinterReducer from './PrinterReducer'
import UserReducer from './UserReducer'
import StatisticsReducer from './StatisticsReducer'
import ProductCategoryReducer from './ProductCategoryReducer'
import StockReducer from './StockReducer'
import BillingReducer from './BillingReducer'
import TaxesReducer from './TaxesReducer'
import InternalReducer from './InternalReducer'
import OnboardingReducer from './OnboardingReducer'
import FormReducer from './FormReducer'
import PlansReducer from './PlansReducer'
import CatalogReducer from './CatalogReducer'
import DashboardReducer from './DashboardReducer'
import VariantsReducer from '../variants/variants.reducer'
import SmartAssistantReducer from './SmartAssistantReducer'
import UserContextReducer from './UserContextReducer'

export default combineReducers({
	form,
	auth: AuthReducer,
	catalog: CatalogReducer,
	sync: SyncReducer,
	currentSale: CurrentSaleReducer,
	lastSale: LsstaleReducer,
	sales: SaleReducer,
	products: ProductsReducer,
	productCategory: ProductCategoryReducer,
	customers: CustomersReducer,
	storeDetail: StoreReducer,
	paymentTypes: PaymentTypesReducer,
	common: CommonReducer,
	externalPayments: ExternalPaymentsReducer,
	preference: PreferenceReducer,
	printer: PrinterReducer,
	user: UserReducer,
	statistics: StatisticsReducer,
	stock: StockReducer,
	billing: BillingReducer,
	taxes: TaxesReducer,
	internal: InternalReducer,
	onboarding: OnboardingReducer,
	plans: PlansReducer,
	_form: FormReducer,
	dashboard: DashboardReducer,
	variants: VariantsReducer,
	smartAssistant: SmartAssistantReducer,
	userContext: UserContextReducer,
})
