import { apiGateway, apiIntegrationsGateway } from './kyte-api-gateway';

export const kyteGeneratePaymentLink = (sale, store, gatewayKey) => apiGateway.post(`/plink/generate-payment-link`, {
  sale: { id: sale.id, aid: sale.aid },
  store,
  gatewayKey,
});

export const kyteFBEUninstallIntegration = (aid) => apiIntegrationsGateway.post(`/fbe/uninstall/${aid}`);

export const kyteTikTokInstallIntegration = (aid, auth_code) =>
  apiIntegrationsGateway.post(`/tiktok-install/${aid}`, { auth_code });

export const kyteTikTokUninstallIntegration = (aid) => apiIntegrationsGateway.get(`/tiktok-uninstall/${aid}`);

export const kyteTikTokIntegration = (aid, timezone) => apiIntegrationsGateway.post(`/tiktok-generate-uri/integration`, {
  aid,
  timezone,
});

export const kyteTiktokAdsCreation = (aid, timezone) => apiIntegrationsGateway.post(`/tiktok-generate-uri/ads`, {
  aid,
  timezone,
});

export const kyteTikTokAdsDetails = (aid) => apiIntegrationsGateway.get(`/tiktok-ads-details/${aid}`);

export const kyteFacebookPixelIntegration = ({ active, pixelId, aid }) => apiIntegrationsGateway.post(`/fbe/facebook-pixel`, {
  active,
  pixelId,
  aid,
});
