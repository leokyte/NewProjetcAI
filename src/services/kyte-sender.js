import { apiGateway } from './kyte-api-gateway';

export const sendReceipt = (saleData) => apiGateway.post('/email/sendReceipt', saleData).then((response) => response);

export const sendCustomerAccountReceipt = (data) => apiGateway.post('/email/sendCustomerAccountReceipt', data);
