import {
	ITax as UTax,
	IShippingFee as UShippingFee,
	IShippingFees as UShippingFees,
	ICatalog as UCatalog,
	IStore as UStore,
	IPermissions as UPermissions,
	IUser as UUser,
} from '@kyteapp/kyte-utils'

export type ITax = UTax
export type IShippingFee = UShippingFee
export type IShippingFees = UShippingFees
export type ICatalog = UCatalog
export type IPermissions = UPermissions
export type IUser = UUser

export interface IDevice {
	uniqueId: string
	deviceNumber: number
}

export interface IPayment {
	type: number
	userDescription: string
	active: boolean
}

export interface IIntegration {
	name: string
	active: boolean
	value: string
	payload?: {
		business_id?: string
		fbe_event?: string
		facebook_profiles?: string[]
		instagram_profiles?: null
		install_time?: number
		pixel_id?: string
		access_token?: string
		token_type?: string
	} | null
}

export interface IBanner {
	active: boolean
	URL: string
}

export interface IStore extends UStore {
	name: string
	urlFriendly: string
	catalog: ICatalog
	email: string
	infoExtra: string
	phone: string
	footerExtra: string
	image: string
	imageURL: string
	headerExtra: string
	address: string
	addressComplement: string
	country: string
	instagram: string
	whatsapp: string
	integrations: IIntegration[]
	showProductBarcodeOnReceipt: boolean
	imageSet: string
}

export interface IAppInfo {
	isOrderHelperNotVisible?: boolean
	alreadySeenCatalogHelper?: boolean
}

export interface IAccount {
	app: string
	_id: string
	active: boolean
	ownerUid: string
	dateCreation: string
	__v: number
	terms: {
		hasAccepted: boolean
		uid: string
		uniqueId: string
		ipAddress: string
		acceptionDate: string
	}
	intercom: {
		id: string
	}
	metadata?: {
		referral?: {
			code?: string
		}
	}
}

export interface IBehaviorStep {
	active: boolean
	completed: boolean
	step: number
	completionDate: string | null
	id: string
}

export interface IBehavior {
	helper: {
		enabled: boolean
		active: boolean
		steps: IBehaviorStep[]
	}
}

export interface IAuthState {
	isLogged: boolean
	signinEmail: string
	signinPassword: string
	signinType: string
	aid: string
	did: number
	multiUsers: IUser[]
	campaignProps: {
		aid: string
	}
	loadingAuthentication: null
	invalidateToken: boolean
	behavior: IBehavior
	user: IUser
	account: IAccount
	store: IStore
}
