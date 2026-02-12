// eslint-disable-next-line import/prefer-default-export
export const linking = {
	prefixes: ['https://app.kyte.com.br', 'https://app.kytepos.com', 'https://app.appkyte.com', 'kyte://'],
	config: {
		screens: {
			OnlineCatalog: {
				initialRouteName: 'CatalogConfigIndex',
				screens: {
					CatalogConfigIndex: {
						path: 'navigate/online-catalog',
					},
					CatalogOnlineOrders: {
						path: 'navigate/order/:configType',
					},
					ConfigOnlinePayments: {
						path: 'navigate/online-catalog/order/online-payments',
					},
					CatalogOrderPayments: {
						path: 'navigate/catalog-payments',
					},
					ShippingFees: {
						path: 'navigate/online-catalog/delivery-options-catalog',
					},
					CatalogBanner: {
						path: 'navigate/online-catalog/banner',
					},
					CatalogTheme: {
						path: 'navigate/online-catalog/display',
					},
				},
			},
			Products: {
				initialRouteName: 'productsIndex',
				screens: {
					ProductsIndex: {
						path: 'navigate/product/index',
					},
					ProductCreate: {
						path: 'navigate/product/create',
					},
				},
			},
			Sales: {
				screens: {
					SalesList: {
						path: 'navigate/sale/:salesType',
					},
				},
			},
			Customers: {
				initialRouteName: 'CustomerIndex',
				screens: {
					CustomerIndex: {
						path: 'navigate/customer/index',
					},
					CustomerCreate: {
						path: 'navigate/customers/create',
					},
				},
			},
			Config: {
				initialRouteName: 'ConfigContainer',
				screens: {
					SocialMediaIntegration: {
						path: 'navigate/social-media-integration/:configType',
					},
					CatalogStore: {
						path: 'navigate/config/biz-info/',
					},
					ConfigIntegratedPayments: {
						path: 'navigate/integrated-payments',
					},
					ConfigContainer: {
						path: 'navigate/config/',
					},
					ShippingFees: {
						path: 'navigate/config/delivery-options/',
					},
					ConfigReceipt: {
						path: 'navigate/config/receipt/',
					},
					ConfigOnlinePayments: {
						path: 'navigate/config/online-payments',
					},
					PixDataConfig: {
						path: 'navigate/pix-billing'
					},
					StorePreferences: {
						path: 'navigate/general',
					},
					DataExport: {
						path: 'navigate/reports',
					},
					Taxes: {
						path: 'navigate/config/sales-tax',
					},
					CatalogOrderStatus: {
						path: 'navigate/config/status',
					},
					ConfigCardService: {
						path: 'navigate/config/card-service',
					},
				},
			},
			Statistics: {
				screens: {
					StatisticsContainer: {
						path: 'navigate/statistic/',
					},
				},
			},
			Plans: {
				screens: {
					PlansContainer: {
						path: 'navigate/billing/',
					},
					RedirectCheckoutWebContainer: {
						path: 'navigate/redirect-web/',
					},
				},
			},
			CurrentSale: {
				initialRouteName: 'ProductSale',
				screens: {
					ProductSale: {
						path: 'navigate/current-sale/:helper',
					},
					CurrentSale: {
						path: 'navigate/current-sale/',
					},
					QuickSale: {
						path: 'navigate/quick-sale/',
					},
				},
			},
			Users: {
				initialRouteName: 'UsersList',
				screens: {
					UsersList: {
						path: 'navigate/user/',
					},
				},
			},
			Helpcenter: {
				initialRouteName: 'Helpcenter',
				screens: {
					HelpCenter: {
						path: 'navigate/helpcenter',
					},
				},
			},
			Dashboard: {
				initialRouteName: 'Dashboard',
				screens: {
					Dashboard: {
						path: 'navigate/home',
					},
				},
			},
			Coupons: {
				initialRouteName: 'CouponsList',
				screens: {
					CouponsList: {
						path: 'navigate/coupons',
					},
					CouponsShippingCreate: {
						path: 'navigate/shipping-coupon',
					},
					CouponsDiscountCreate: {
						path: 'navigate/discount-coupon',
					}
				},
			}
		},
	},
}
