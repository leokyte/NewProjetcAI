const FACEBOOK_APP_ID = 993529217860479;
const REDIRECT_URI = 'https://app.kytepos.com/integrations/fbe';
const CTA_BUTTON_TEXT = 'Order Food';
const BELOW_BUTTON_TEXT = 'Powered by Kyte';
const baseURL = `https://facebook.com/dialog/oauth?client_id=${FACEBOOK_APP_ID}&display=page`;

export const generateFBEIntegrationURI = ({ aid, timezone, currency, store_name, url }) => {
  const extras = {
    setup: {
      external_business_id: aid,
      timezone,
      currency,
      business_vertical: 'FOOD_AND_DRINK',
      domain: url,
    },
    business_config: {
      business: {
        name: store_name,
      },
      page_cta: {
        enabled: true,
        cta_button_text: CTA_BUTTON_TEXT,
        cta_button_url: url,
        below_button_text: BELOW_BUTTON_TEXT,
      },
      ig_cta: {
        enabled: true,
        cta_button_text: CTA_BUTTON_TEXT,
        cta_button_url: url,
      },
      messenger_menu: {
        enabled: true,
        cta_button_text: CTA_BUTTON_TEXT,
        cta_button_url: url,
      },
    },
    repeat: false,
  };
  const uri = `${baseURL}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=manage_business_extension&extras=${JSON.stringify(extras)}`;
  return encodeURI(uri);
};
