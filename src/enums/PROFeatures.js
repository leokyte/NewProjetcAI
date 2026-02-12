/*
 * name -> Name of the feature inside the app
 * remoteKey -> remote key name at Remote Config
 * isPro -> sets if this feature is PRO or not
 * infoType -> if default must show the default information inside the app
 * infoURL -> if infoType is equals to 'remote' must contains the URL of the content for the webview
 */
export const PROFeatures = {
  FACEBOOK_ORDER_FOOD: 0,
  FACEBOOK_PIXEL: 1,
  FACEBOOK_SHOPPING: 2,
  GOOGLE_SHOPPING: 3,

  ONLINE_ORDERS: 4,
  ONLINE_ORDERS_DELIVERY_RATES: 0,
  ONLINE_ORDERS_PICKUP: 1,
  ONLINE_ORDERS_FEE: 2,
  ONLINE_ORDERS_PAYMENT_METHODS: 3,
  ONLINE_ORDERS_GUEST_ORDERS: 4,

  TIKTOK: 5,
  MULTIUSER: 6,
  items: [
    {
      name: 'FacebookOrderFood',
      remoteKey: 'PROFacebookOrderFood',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'FacebookPixel',
      remoteKey: 'PROFacebookPixel',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'FacebookShopping',
      remoteKey: 'PROFacebookShopping',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'GoogleShopping',
      remoteKey: 'PROGoogleShopping',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'OnlineOrders',
      remoteKey: 'PROOnlineOrders',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
      innerFeatures: [
        { name: 'OnlineOrders_DeliveryRates', infoType: 'default', infoURL: '' },
        { name: 'OnlineOrders_Pickup', infoType: 'default', infoURL: '' },
        { name: 'OnlineOrders_Fee', infoType: 'default', infoURL: '' },
        { name: 'OnlineOrders_PaymentMethods', infoType: 'default', infoURL: '' },
        { name: 'OnlineOrders_GuestOrders', infoType: 'default', infoURL: '' },
      ],
    },
    {
      name: 'TikTok',
      remoteKey: 'PROTikTok',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'Multiuser',
      remoteKey: 'PROMultiuser',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
    },
    {
      name: 'UserLimit',
      remoteKey: 'PROUserLimit',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'remote',
      infoURL: '',
      innerFeatures: [
        {
          plan: 'free',
          limit: 1,
        },
        {
          plan: 'pro',
          limit: 3,
        },
        {
          plan: 'grow',
          limit: 10,
        },
        {
          plan: 'prime',
          limit: 999,
        },
      ],
    },
    {
      name: 'MultiPhotos',
      remoteKey: 'PROMultiPhotos',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: '',
      innerFeatures: [
        {
          plan: 'free',
          limit: 1,
        },
        {
          plan: 'pro',
          limit: 4,
        },
        {
          plan: 'grow',
          limit: 7,
        },
        {
          plan: 'prime',
          limit: 7,
        },
      ],
    },
    {
      name: 'Banner',
      remoteKey: 'PROBanner',
      isPaid: true,
      plans: ['pro', 'grow', 'prime'],
      infoType: 'default',
      infoURL: 'restrictions/banner',
    },
    {
			name: 'SaveOrder',
			remoteKey: 'PROSaveOrder',
			isPaid: true,
			plans: ['pro', 'grow', 'prime'],
			infoType: 'default',
			infoURL: 'restrictions/order-control',
		},
		{
			name: 'SalesTax',
			remoteKey: 'PROSalesTax',
			isPaid: true,
			plans: ['pro', 'grow', 'prime'],
			infoType: 'default',
			infoURL: 'restrictions/sales-tax',
    },
    {
			name: 'CustomColor',
			remoteKey: 'PROCustomColor',
			isPaid: true,
			plans: ['pro', 'grow', 'prime'],
			infoType: 'default',
			infoURL: 'restrictions/cor-personalizada',
		},
  ],
};
