import { Dispatch } from 'react-redux'
import {
	IVariant,
	CREATE_VARIATION,
	IS_CREATING_SKUS,
	IVariantsState,
	GET_VARIATIONS,
	IS_FETCHING_VARIATIONS,
	SET_VARIANTS_NOTIFICATIONS,
	GET_PRODUCT_VARIANTS,
} from '../variants.types'
import {
	kyteApiCreateVariation,
	kyteApiGenerateSKUs,
	kyteApiGetVariations,
	kyteApiUpdateVariation,
} from '../../../services/kyte-backend'
import { IProduct, IProductWithVariation, IVariation } from '@kyteapp/kyte-utils'
import { getPrimaryVariant, getVariantNewOptions, totalOptionsCount } from '../../../util/products/util-variants'
import { IAuthState } from '../../../types/state/auth'
import { PRODUCT, save } from '../../../repository'
import { resetWizardVariation } from './wizard-variation.actions'
import { Alert } from 'react-native'
import { KyteNotificationProps } from '@kyteapp/kyte-ui-components/src/packages/utilities/kyte-notification/KyteNotification'
import { NotificationType } from '@kyteapp/kyte-ui-components/src/packages/enums'
import I18n from '../../../i18n/i18n'
import { RootState } from '../../../types/state/RootState'
import { productSave } from '../../actions/ProductActions'
import { logEvent } from '../../../integrations'
import { colors } from '../../../styles'
import KyteMixpanel from '../../../integrations/Mixpanel'

// Create the variations based on the wizard state
/**
 * Asynchronous action to create or update a list of product variations.
 *
 * This function processes a list of variations, categorizing them into three groups:
 * - Variations to be created (new variations without an `_id`).
 * - Variations to be updated (existing variations with new options).
 * - Variations to be ignored (existing variations without changes).
 *
 * It then performs the necessary API calls to create or update the variations
 * and dispatches the results to the Redux store.
 *
 * @param variants - An array of variations to be processed. Each variation can be either
 *                   a complete `IVariant` object or `undefined`.
 * @returns A promise that resolves to an array of all processed variations, including
 *          newly created, updated, and ignored variations.
 *
 * @throws Will throw an error if any of the API calls fail.
 *
 * ### Process:
 * 1. Categorize the input variations:
 *    - Variations with an `_id` are checked against the current state to determine
 *      if they need to be updated or ignored.
 *    - Variations without an `_id` are marked for creation.
 * 2. Perform API calls:
 *    - Create new variations using `kyteApiCreateVariation`.
 *    - Update existing variations with new options using `kyteApiUpdateVariation`.
 *    - Ignore unchanged variations by resolving them as-is.
 * 3. Dispatch the created/updated variations to the Redux store.
 *
 * ### Redux:
 * Dispatches the `CREATE_VARIATION` action for each created or updated variation.
 *
 * @example
 * ```typescript
 * const variants = [
 *   { _id: '1', name: 'Variant 1', options: ['Option A'] },
 *   { name: 'Variant 2', options: ['Option B'] },
 * ];
 *
 * dispatch(createVariations(variants))
 *   .then((result) => console.log('Processed Variations:', result))
 *   .catch((error) => console.error('Error:', error));
 * ```
 */
export const createVariations =
	(variants: (IVariant | undefined)[]) =>
	async (dispatch: Dispatch, getState: () => RootState): Promise<IVariant[]> => {
		// Arrays to categorize the variations
		const variantsToBeCreated: IVariant[] = []
		const variantsToBeUpdated: IVariant[] = []
		const variantsToBeIgnored: IVariant[] = []
		const { variants: variantsState } = getState() as { variants: IVariantsState }

		// Categorize the input variations
		variants.forEach((variant) => {
			if (variant && variant._id) {
				// Check if the variant exists in the current state
				const variantToBeUpdated = variantsState.list.find((variantOnList) => variantOnList._id === variant?._id)
				const newOptions = !variantToBeUpdated ? [] : getVariantNewOptions(variantToBeUpdated, variant.options)

				if (newOptions.length) {
					// Update the variant with new options
					const updatedOptions = [...(variantToBeUpdated?.options ?? []), ...newOptions]
					const updatedVariant: IVariant = { ...variant, options: updatedOptions } as IVariant
					variantsToBeUpdated.push(updatedVariant)
				} else {
					// Ignore the variant if no changes are detected
					variantsToBeIgnored.push(variant)
				}
			} else {
				// Mark the variant for creation if it doesn't have an `_id`
				variantsToBeCreated.push(variant as IVariant)
			}
		})

		try {
			// Perform API calls to create, update, or ignore variations
			const responses = await Promise.all([
				...variantsToBeCreated.map(kyteApiCreateVariation),
				...variantsToBeUpdated.map(kyteApiUpdateVariation),
				...variantsToBeIgnored.map((variant) => Promise.resolve({ data: variant })),
			])
			if (variantsToBeCreated?.length > 0) {
				variantsToBeCreated?.map((variant) => {
					logEvent('Variation Create', {
						variation_is_primary: Boolean(variant.isPrimary),
						variation_options: variant.options.map((option) => option.title),
						variation_id: variant._id || variant.id,
						variation_name: variant.name,
					})
				})
			}
			const allVariants = responses.map((response) => response?.data)

			// Dispatch the created/updated variations to the Redux store
			allVariants.forEach((variant) => dispatch({ type: CREATE_VARIATION, payload: variant }))

			return allVariants
		} catch (error: any) {
			console.error('Error creating variations:', error)
			throw error
		}
	}

// Generate the product SKUs based on the variations criated on wizard
export type TGenerateSKUsResult = IProductWithVariation
export const generateProductSKUs =
	(
		variations: (IVariant | undefined)[],
		product: Partial<IProduct>,
		callback?: (error: Error | null, result?: TGenerateSKUsResult) => void
	) =>
	async (dispatch: Dispatch, getState: any) => {
		try {
			// Check global state to prevent duplicate requests
			const wizardState = getState()?.variants?.wizard as IVariantsState['wizard']
			// Get the wizard state to find which variation isPrimary
			const origin = getState()?.products.detailOrigin
			const authState = getState()?.auth as IAuthState

			if (wizardState?.isCreatingSKUs) return

			dispatch({ type: IS_CREATING_SKUS, payload: true })
			// Create variations with kyteApiCreateVariation API
			const createdVariants = await createVariations(variations)(dispatch, getState)
			// Use the wizard state to set the primary variation
			const variantsWithPrimaryFlag = getPrimaryVariant(createdVariants, wizardState.chosenVariations ?? [])
			// Calls the API with the created variations to generate the SKUs
			const generatedSKUs = await kyteApiGenerateSKUs(variantsWithPrimaryFlag, product, authState.aid)
			// First SKU is the parent product, The rest of the SKUs are the children products
			const [parentProduct, ...childrenProducts] = generatedSKUs ?? []
			await save(PRODUCT, parentProduct)
			const { notifications = [] } = getState().variants ?? {}
			const notification: KyteNotificationProps = {
				title: I18n.t('variants.apiGenerateSKUSuccess'),
				type: NotificationType.SUCCESS,
			}
			const updatedNotifications = [...notifications, notification]
			dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			dispatch({ type: IS_CREATING_SKUS, payload: false })
			dispatch({ type: GET_PRODUCT_VARIANTS, payload: childrenProducts })

			resetWizardVariation()(dispatch)
			callback?.(null, parentProduct)
			logEvent('Product Create', {
				origin: origin === 2 ? 'Sale Flow' : 'Menu',
				hasColor: parentProduct.background !== colors.primaryBg,
				hasImage: !!parentProduct.image,
				isFractioned: parentProduct.isFractioned,
				userEmail: authState?.user?.email,
				hasVariants: Boolean(childrenProducts?.length),
				variations: parentProduct?.variations?.length,
				variants: childrenProducts?.length,
				options: totalOptionsCount(parentProduct?.variations as IVariation[]),
			})
		} catch (error: any) {
			callback?.(error)
			const { notifications = [] } = getState().variants ?? {}
			// TO-DO: Remove the error response from notification
			const notification: KyteNotificationProps = {
				title: I18n.t('variants.apiGenerateListError'),
				// title: I18n.t('variants.apiGenerateSKUErro'),
				type: NotificationType.ERROR,
			}
			const updatedNotifications = [...notifications, notification]
			dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			dispatch({ type: IS_CREATING_SKUS, payload: false })

			logEvent('Product Variants Create Error', { error: error.message })
			console.error('Error generating SKUs:', error.message)
		}
	}

// Get account variations from the API
export const getVariations =
	(aid: string, callback?: (error?: string) => void, isNotificationsOff = false) =>
	async (dispatch: Dispatch, getState: any) => {
		try {
			const { auth } = getState()
			const { user } = auth
			dispatch({ type: IS_FETCHING_VARIATIONS, payload: true })
			const response = await kyteApiGetVariations(aid)
			const variations = response?.data
			const userProps = new Map([
				['Store Id (aid)', user?.aid],
				[
					'Variations',
					variations.map((v: IVariation) => {
						return {
							name: v.name,
							options: v.options.map((o) => o.title),
						}
					}),
				],
			])

			KyteMixpanel.setTrackingProperties(userProps, {})

			dispatch({ type: GET_VARIATIONS, payload: variations })
			dispatch({ type: IS_FETCHING_VARIATIONS, payload: false })
			callback?.()
		} catch (error: any) {
			// Temporary Alert to show the error
			const { notifications = [] } = getState().variants ?? {}
			const notification: KyteNotificationProps = {
				title: I18n.t('variants.apiGetVariationsListError'),
				type: NotificationType.ERROR,
			}
			const updatedNotifications = [...notifications, notification]
			if (!isNotificationsOff) dispatch({ type: SET_VARIANTS_NOTIFICATIONS, payload: updatedNotifications })
			dispatch({ type: IS_FETCHING_VARIATIONS, payload: false })
			// console.error('Error getting variations:', error)
			callback?.('Error getting variations')
		}
	}
