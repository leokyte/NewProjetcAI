import { apiGateway } from './kyte-api-gateway';

export const kyteAccountStatements = (aid, filter) =>
  apiGateway.post(`/customer/get-account-movements/aid/${aid}`, { ...filter });

export const kyteCustomerAccountStatements = (customerId, filter) =>
  apiGateway.post(`/customer/get-account-movements/customer/${customerId}`, { ...filter });

export const kyteDataGetStockHistory = (productId) => apiGateway.post(`/stock/${productId}`);

export const kyteDataFilterStockHistory = (productId, filter) =>
  apiGateway.post(`/stock/${productId}`, { ...filter });

export const kyteDataSetStockEntry = (stock) => apiGateway.post('/stock-add', { ...stock });

export const kyteDataSetStockActivity = (product) =>
  apiGateway.post('/stock-inactive', { ...product });

export const kyteDataSync = (aid) => apiGateway.get(`/export-sync/${aid}`);

export const sendReport = ({
  aid,
  models,
  period,
  receiver,
  userLanguage,
  currencyCode,
  accountCountryCode,
  tz,
}) =>
  apiGateway.post(`/export/sender-email/${aid}`, {
    models,
    period,
    receiver,
    userLanguage,
    currencyCode,
    accountCountryCode,
    tz,
  });

export const kyteDataProductsStockReview = (items) =>
  apiGateway.post('/products-stock-review', { items });

export const kyteGetProduct = (id) => apiGateway.get(`/product/${id}`);

export const kyteGeneratePixQRCode = (saleId, aid, uid) => apiGateway.put(`/sale/generatePixQrcode/${saleId}/${aid}`, 
  {},
  {
		headers: {
			uid,
		},
})

