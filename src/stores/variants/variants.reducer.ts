import {
	IVariantsState,
	SET_WIZARD_PRODUCT_ID,
	SET_WIZARD_VARIATION,
	REMOVE_WIZARD_VARIATION,
	REMOVE_WIZARD_VARIATION_OPTION,
	SET_WIZARD_SELECTED_VARIANT,
	VariantActionsTypes,
	CREATE_VARIATION,
	GENERATE_PRODUCT_SKUS,
	IS_CREATING_SKUS,
	SET_WIZARD_PRIMARY_VARIANT,
	RESET_WIZARD_VARIATION,
	SET_SKUS_GENERATION_LIMIT,
	GET_VARIATIONS,
	IS_FETCHING_VARIATIONS,
	SET_VARIANTS_NOTIFICATIONS,
	SET_VARIANT_MANAGEMENT_VALUE,
	GET_PRODUCT_VARIANTS,
	SET_PARENT_PRODUCT_STOCK_ACTIVE,
	SET_PARENT_PRODUCT_STOCK_INACTIVE,
	RESET_VARIANTS_STATE,
	SET_PRODUCT_VARIANT_DETAIL,
	SET_CHECKOUT_PRODUCT,
	SET_VARIATION_DETAIL,
	SET_VARIANTS_NEEDS_REFRESH,
} from './variants.types'
import { LOGOUT } from '../actions/types'
import { buildProductManaging } from '../../util/util-product'
import { variationFormReducer } from './reducers/variation-form.reducer'
import { VariationFormActionTypes } from './actions/variation-form.actions'

export const SKU_GENERATION_LIMIT = 100

const initialState: IVariantsState = {
	list: [],
	selected: undefined,
	isFetchingList: false,
	notifications: [],
	wizard: {
		productId: undefined,
		selected: undefined,
		skus: undefined,
		isCreatingSKUs: false,
		chosenVariations: [],
		skusGenerationLimit: {
			max: SKU_GENERATION_LIMIT,
			current: 0,
			isOffLimit: false,
			isAtLimit: false,
		},
	},
	productVariant: undefined,
	productVariants: undefined,
	productManaging: {
		initialStock: 0,
		currentStock: 0,
		minimumStock: 0,
		productPhoto: '',
		productOtherPhotos: [],
		productColor: '',
		category: null,
		isFractioned: false,
		isStockEnabled: false,
		contentHasChanged: false,
	},
	stockHistory: undefined,
	stockHistoryTotal: undefined,
	checkoutProduct: undefined,
	variationDetail: undefined,
	needsRefresh: false,
	variationForm: {
		mode: 'create',
		variationId: undefined,
		variationName: '',
		options: [],
		isLoading: false,
		notifications: [],
		editingOption: null,
		isOptionModalVisible: false,
		isNameModalVisible: false,
		originalVariationName: undefined,
		originalOptions: undefined
	},
}

const VariantsReducer = (state: IVariantsState = initialState, action: VariantActionsTypes | VariationFormActionTypes): IVariantsState => {
	switch (action.type) {
		case SET_WIZARD_PRODUCT_ID:
			return {
				...state,
				wizard: {
					...state.wizard,
					productId: action.payload,
				},
			}
		case SET_WIZARD_VARIATION: {
			const chosenVariations = state.wizard.chosenVariations ?? []
			const currentVariation = chosenVariations?.find?.((variation) => variation.id === action.payload.id)
			const updatedVariations = currentVariation
				? chosenVariations?.map((variation) => (variation.id === action.payload.id ? action.payload : variation))
				: [...chosenVariations, action.payload]

			return {
				...state,
				wizard: {
					...state.wizard,
					chosenVariations: updatedVariations,
				},
			}
		}
		case REMOVE_WIZARD_VARIATION:
			return {
				...state,
				wizard: {
					...state.wizard,
					chosenVariations:
						state.wizard.chosenVariations?.filter?.((variation) => variation.id !== action.payload.id) ?? [],
				},
			}
		case REMOVE_WIZARD_VARIATION_OPTION:
			const { variant, optionId } = action.payload
			const updatedOptions = variant.options.map((option) =>
				option.id === optionId ? { ...option, active: false } : option
			)
			return {
				...state,
				wizard: {
					...state.wizard,
					chosenVariations: state.wizard.chosenVariations?.map((variation) =>
						variation.id === variant.id ? { ...variant, options: updatedOptions } : variation
					),
				},
			}
		case SET_WIZARD_SELECTED_VARIANT:
			return {
				...state,
				wizard: {
					...state.wizard,
					selected: {
						step: action.payload?.id,
						variant: action.payload,
					},
				},
			}
		case CREATE_VARIATION:
			return {
				...state,
				list: [...state.list, action.payload],
			}
		case GENERATE_PRODUCT_SKUS:
			return {
				...state,
				wizard: {
					...state.wizard,
					skus: action.payload,
				},
			}
		case IS_CREATING_SKUS:
			return {
				...state,
				wizard: {
					...state.wizard,
					isCreatingSKUs: action.payload,
				},
			}
		case SET_WIZARD_PRIMARY_VARIANT:
			const chosenVariations = state.wizard.chosenVariations?.map((variation) => ({
				...variation,
				isPrimary: variation.id === action.payload.id,
			}))

			return {
				...state,
				wizard: {
					...state.wizard,
					chosenVariations,
				},
			}
		case SET_SKUS_GENERATION_LIMIT:
			const { wizard } = state
			const { variantId, options } = action.payload
			const otherVariations = wizard.chosenVariations?.filter?.((variation) => variation.id !== variantId) ?? []
			const chosenActiveOptionsTotal =
				otherVariations.reduce(
					(acc, variation) => acc + variation.options.filter((option) => option.active).length,
					0
				) || 1

			const current = chosenActiveOptionsTotal * options.length

			return {
				...state,
				wizard: {
					...wizard,
					skusGenerationLimit: {
						...wizard.skusGenerationLimit,
						current,
						isOffLimit: current > SKU_GENERATION_LIMIT,
						isAtLimit: current === SKU_GENERATION_LIMIT,
					},
				},
			}
		case RESET_WIZARD_VARIATION:
			return {
				...state,
				wizard: {
					...state.wizard,
					chosenVariations: [],
				},
			}
		case GET_VARIATIONS:
			return {
				...state,
				list: action.payload,
			}
		case IS_FETCHING_VARIATIONS:
			return {
				...state,
				isFetchingList: action.payload,
			}
		case SET_VARIANTS_NOTIFICATIONS: {
			return { ...state, notifications: action.payload }
		}
		case SET_CHECKOUT_PRODUCT: {
			return { ...state, checkoutProduct: action.payload }
		}
		case SET_VARIANT_MANAGEMENT_VALUE: {
			const { value, property, set } = action.payload
			const { contentHasChanged = false } = state.productManaging ?? {}

			const productProps: (keyof ReturnType<typeof buildProductManaging>)[] = [
				'productPhoto',
				'productColor',
				'category',
				'isFractioned',
				'isStockEnabled',
			]
			const isInitial = set === 'initial'
			const contentChangeCheck = () => {
				if (isInitial) return false
				return productProps.includes(property)
			}

			const productManaging: IVariantsState['productManaging'] = {
				...state.productManaging,
				[property]: value,
				contentHasChanged: contentHasChanged || contentChangeCheck(),
			} as any

			return {
				...state,
				productManaging,
			}
		}

		case GET_PRODUCT_VARIANTS:
			return { ...state, productVariants: action.payload }
		case RESET_VARIANTS_STATE:
			return { ...initialState }
		case SET_PRODUCT_VARIANT_DETAIL:
			return {
				...state,
				productVariant: action.payload,
				productManaging: buildProductManaging(action.payload, state.productManaging as any),
			}
		case LOGOUT:
			return initialState
		case SET_PARENT_PRODUCT_STOCK_ACTIVE:
		case SET_PARENT_PRODUCT_STOCK_INACTIVE:
		case SET_VARIATION_DETAIL:
			return {
				...state,
				variationDetail: (action as any).payload,
			}
		case SET_VARIANTS_NEEDS_REFRESH:
			return {
				...state,
				needsRefresh: action.payload,
			}
		default:
			const newVariationForm = variationFormReducer(state.variationForm, action as VariationFormActionTypes)
			if (newVariationForm !== state.variationForm) {
				return {
					...state,
					variationForm: newVariationForm
				}
			}
			return state
	}
}

export default VariantsReducer
