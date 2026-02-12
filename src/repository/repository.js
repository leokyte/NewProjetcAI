import _ from 'lodash'
import moment from 'moment/min/moment-with-locales'
import models from './models.js'
import { adapterObjectToModel } from './model.adapter'
import { getOwnerUID, getAID, getUserAccountIds, getUserName } from '../util/local-cache'
import { groupSalesDailyTotals, getSalesTotals } from '../util/util-sale'
import KyteErrorHandler from '../integrations/ErrorHandler'
import { SyncUpRepositoryData } from '../sync/syncDataManager'
import { kyteQueryGetProducts } from '../services/kyte-query.js'
import { checkIsVariant, getVariantsMap } from '../util/products/util-variants'

export const PRODUCT = 'Product'
export const PRODUCT_CATEGORY = 'ProductCategory'
export const CUSTOMER = 'Customer'
export const SALE = 'Sale'
export const STORE = 'Store'

export const filterAID = () => `aid = "${getAID()}"`

const FETCH_LIMIT = 5000
// FETCH

export const fetchSaleFilter = (filters, options) => {
	const fetchOptions = setOptions(options)
	return new Promise((resolve) => {
		let items = models.objects(SALE)
		if (filters && filters.length > 0) {
			filters.forEach((f) => {
				items = items.filtered(f)
			})
		}
		// Filters
		items = items.filtered('active = true')
		items = items.filtered(filterAID())
		// Sort
		items = items.sorted(fetchOptions.sort.key, fetchOptions.sort.isDesc)

		resolve({ items })
	})
}

/**
 * Fetches products and merge into them theirs respective variants
 *
 * This function retrieves a list of products and maps their variants, returning
 * a list of non-variant products with their associated variants included. If the
 * operation fails or times out, it resolves with no data.
 *
 * @param {string} aid - The account ID used to fetch the products.
 * @returns {Promise<<import('@kyteapp/kyte-utils').IProduct>[]| undefined>} A promise that resolves to an array of products
 * with their variants or `undefined` if the operation fails or times out.
 */
const fetchProductWitVariants = (aid) =>
	new Promise((doResolve) => {
		kyteQueryGetProducts({ aid, params: { limit: FETCH_LIMIT } })
			.then((response) => {
				const products = response?.data?._products

				if (Array.isArray(products)) {
					const variantsMap = getVariantsMap(products)
					const nonVariantProducts = products.filter((product) => !checkIsVariant(product))
					const fullProducts = nonVariantProducts.map((product) => ({
						...product,
						variants: variantsMap[product._id || product.id],
					}))
					doResolve(fullProducts)
				}
				doResolve()
			})
			.catch(() => doResolve())
		setTimeout(doResolve, 5000)
	})

export const fetchFilter = (modelName, filters, options, size = {}, status) => {
	const fetchOptions = setOptions(options)
	const hasSize = size && size.limit
	const isSale = modelName === SALE
	let listSize
	let dailyTotals
	let salesTotals

	const p = new Promise((resolve) => {
		let list = models.objects(modelName)

		if (filters && filters.length > 0) {
			filters.forEach((f) => {
				list = list.filtered(f)
			})
		}

		list = list.filtered('active = true')
		list = list.filtered(filterAID())
		listSize = list.length

		if (isSale) {
			dailyTotals = groupSalesDailyTotals(list, status)
			salesTotals = getSalesTotals(dailyTotals)
		}

		// Sort
		if (modelName === PRODUCT) {
			list = list.sorted([
				['pin', true],
				[fetchOptions.sort.key, fetchOptions.sort.isDesc],
			])

			// fetching products by HTTP request()
			try {
				// const aid = getAID()
				// const fullProducts = await fetchProductWitVariants(aid)
				// if (fullProducts) list = fullProducts
			} catch {
				/* */
			}
		} else list = list.sorted(fetchOptions.sort.key, fetchOptions.sort.isDesc)

		if (hasSize) {
			resolve({
				items: list.slice(size.length, size.length + size.limit),
				listSize,
				dailyTotals,
				salesTotals,
			})
		} else {
			resolve(list.slice(0, FETCH_LIMIT))
		}
	})

	return p
}

export const fetchSynchronous = (modelName, filters) => {
	let list = models.objects(modelName)
	list = list.filtered('active = true')
	filters.forEach((f) => {
		list = list.filtered(f)
	})
	return list
}

export const fetch = (modelName, options, length) => fetchFilter(modelName, null, options, length)

export const fetchOneByID = (modelName, id, errorCb) => {
	const model = models.objectForPrimaryKey(modelName, id)
	if (model) return model
	if (errorCb) errorCb()
}

export const fetchOneByUID = (modelName) => {
	const uid = getOwnerUID()
	const items = _.values(models.objects(modelName))
	const model = items ? _.filter(items, { uid })[0] : null

	return new Promise((resolve) => resolve(model))
}

export const fetchByAID = (modelName) => models.objects(modelName).filtered(filterAID())

export const fetchByAIDWithFilter = (modelName) =>
	models.objects(modelName).filtered(filterAID()).filtered('active = true')

export const fetchByName = (modelName, name, options) => {
	const filterName = `name CONTAINS[c] "${name}"`
	return fetchFilter(modelName, [filterName], options)
}

export const fetchByNameAndCode = (modelName, term, options, size) => {
	const filter = `name CONTAINS[c] "${term.toString()}" OR code CONTAINS[c] "${term.toString()}" OR search CONTAINS[c] "${term.toString()}"`
	return fetchFilter(modelName, [filter], options, size)
}

export const fetchByTerm = (modelName, term, properties, options) => {
	if (term) {
		let queryOr = ''
		properties.forEach((p, i) => {
			queryOr += `${p} CONTAINS[c] "${term}" ${i !== properties.length - 1 ? 'OR ' : ''}`
		})

		return fetchFilter(modelName, [queryOr], options)
	}

	return fetchFilter(modelName, null, options)
}

export const fetchFilterOr = (modelName, filters, options, size, limitless) => {
	const fetchOptions = setOptions(options)
	const hasSize = size && size.limit
	let listSize

	const p = new Promise((resolve) => {
		let list = models.objects(modelName)

		if (filters && filters.length > 0) {
			list = list.filtered(filters.join(' OR '))
		}

		list = list.filtered('active = true')
		list = list.filtered(filterAID())

		list = list.sorted(fetchOptions.sort.key, fetchOptions.sort.isDesc)

		if (hasSize) {
			resolve(list.slice(size.length, size.length + size.limit))
		} else if (!limitless) {
			resolve(list.slice(0, FETCH_LIMIT))
		} else {
			resolve(list)
		}
	})
	return hasSize ? { listItems: p, listSize } : p
}

export const fetchWithoutActive = (modelName, filters, options) => {
	const fetchOptions = setOptions(options)
	const p = new Promise((resolve) => {
		let list = models.objects(modelName)

		if (filters && filters.length > 0) {
			filters.forEach((f) => {
				list = list.filtered(f)
			})
		}

		list = list.filtered(filterAID())
		list = list.sorted(fetchOptions.sort.key, fetchOptions.sort.isDesc)
		resolve(list.slice(0, FETCH_LIMIT))
	})
	return p
}

export const next = (modelName) => {
	const modelList = _.orderBy(models.objects(modelName).filtered(filterAID()), ['number'], ['asc'])
	const lastModel = modelList[modelList.length - 1]

	return modelList.length ? lastModel.number + 1 : 1
}

// CRUD

export const save = (modelName, model) => (model.id ? update(modelName, model.id, model) : create(modelName, model))

const saveDocument = (
	modelName,
	model,
	isUpdated,
	successCallback = (document) => SyncUpRepositoryData(modelName, document, isUpdated)
) => {
	const p = new Promise((resolve) => {
		try {
			models.write(() => {
				const document = models.create(modelName, model, true)
				if (successCallback) {
					successCallback?.(document)
				}
				resolve(document)
			})
		} catch (ex) {
			if (__DEV__) {
				console.tron.logImportant(model, ex.message)
				console.error(ex.message)
			}

			KyteErrorHandler.addItemInErrorsQueue(ex)
		}
	})
	return p
}

export const create = async (modelName, model, successCallback) => {
	// checking if that document already has an UID.
	// if so, just repeat it (cloning case)
	const modelDefaultValues = defaultValues()
	modelDefaultValues.uid = model.uid || modelDefaultValues.uid

	const document = await saveDocument(modelName, { ...model, ...modelDefaultValues }, false, successCallback)

	return document
}

export const update = (modelName, id, args, successCallback) =>
	saveDocument(modelName, { id, ...args }, true, successCallback)

export const updateVirtualData = (modelName, { id, virtual }) => {
	const p = new Promise((resolve) => {
		models.write(() => {
			try {
				models.create(modelName, { id, virtual }, true)
			} catch (ex) {
				KyteErrorHandler.addItemInErrorsQueue(ex)
			}
			resolve()
		})
	})

	return p
}

export const updateManyVirtualData = (modelName, documents) => {
	const p = new Promise((resolve) => {
		models.write(() => {
			documents.forEach(({ id, virtual }) => {
				try {
					models.create(modelName, { id, virtual }, true)
				} catch (ex) {
					KyteErrorHandler.addItemInErrorsQueue(ex)
				}
			})
			resolve()
		})
	})
	return p
}

export const remove = (modelName, id) => update(modelName, id, { active: false })

export const insertMany = (modelName, documents, isUpdated = false) =>
	new Promise((resolve) => {
		models.write(() => {
			const documentsModel = documents.map((d, i) => ({ ...d, ...defaultValues(i) }))
			documentsModel.forEach((document) => {
				try {
					models.create(modelName, document, isUpdated)
				} catch (ex) {
					KyteErrorHandler.addItemInErrorsQueue(ex)
				}
			})
			SyncUpRepositoryData(modelName, documentsModel)
		})
		resolve()
	})

export const updateMany = (documents) =>
	new Promise((resolve) => {
		models.write(() => {
			documents.forEach((document) => {
				try {
					models.create(document.metadata.model, adapterObjectToModel(document.metadata.model, document.data), true)
				} catch (ex) {
					KyteErrorHandler.addItemInErrorsQueue(ex)
				}
			})
		})
		resolve()
	})

const defaultValues = (index) => {
	const { uid, aid, sid, did } = getUserAccountIds()
	const { name } = getUserName()
	const dateCreation = new Date()
	const dateCreationInt = parseInt(moment(new Date()).format('YYYYMMDD'))
	return {
		id: generateGuid(aid, index),
		uid,
		aid,
		sid,
		did,
		userName: name,
		active: true,
		dateCreation,
		dateCreationInt,
	}
}

const setOptions = (options) => {
	const sort = !!options && !!options.sort ? options.sort : { key: 'name', isDesc: false }
	return { sort }
}

export const generateGuid = (aid, index) => {
	const d = Number(new Date())
	const id = index ? `${d}${index}-${aid.substring(0, 4)}` : `${d}-${aid.substring(0, 5)}`
	return id
}

export const deleteDocuments = (documents) =>
	new Promise((resolve) => {
		models.write(() => {
			documents.forEach((doc) => {
				const model = models.objectForPrimaryKey(doc.model, doc.id)
				if (model) models.delete(model)
			})
			resolve()
		})
	})

export const deleteAll = () =>
	new Promise((resolve) => {
		models.write(() => {
			removeCollection(models, PRODUCT)
			removeCollection(models, PRODUCT_CATEGORY)
			removeCollection(models, CUSTOMER)
			removeCollection(models, SALE)
			resolve()
		})
	})

const removeCollection = (context, collection) => {
	const all = context.objects(collection)
	context.delete(all)
}

export const checkSyncProductStock = (item) => {
	// In case of item with no product registered
	if (!item.product) return true

	// Extract info
	const { prodId } = item.product
	const amountToConfirm = item.product.isFractioned ? item.fraction : item.amount

	// Find product
	const product = fetchOneByID(PRODUCT, prodId) || { stock: null, stockActive: false }
	const { stock, stockActive } = product

	// A-OK if stock not set
	if (!stock || !stockActive) return true

	return stock.current > 0 && amountToConfirm <= stock.current
}

export const checkPinProducts = () => {
	let list = models.objects(PRODUCT)
	list = list.filtered('active = true')
	return !!list.find((p) => p.pin)
}

export const getFirstFilteredElement = (tableName, filter) =>
	models
		.objects(tableName)
		.filtered(filter)
		.find(() => true)
