import React from 'react';
import UrlCopyPage from '../templates/UrlCopyPage';
import I18n from '../../../../i18n/i18n';
import { GoogleShoppingPageImage } from '../../../../../assets/images';

const Strings = {
  PAGE_TITLE: 'Google Shopping',
  INFO: 'Google Merchant Center',
  LANG: I18n.t('fbIntegration.imageCode'),
  PARTNER_NAME: 'Google Shopping',
  PARTNER_SETUP_LINK: I18n.t('googleShoppingSetupLink'),
  FEED_PARTNER: 'google',
  TUTORIAL_LINK: I18n.t('googleShoppingTutorialLink'),
};

const GoogleShopping = (props) => {
  // set image
  const image = {
    src: GoogleShoppingPageImage(Strings.LANG),
    style: { height: 198, width: 198 },
  };

  const successCopiedModalSetup = {
    partnerLink: Strings.PARTNER_SETUP_LINK,
    partnerName: Strings.PARTNER_NAME,
    partnerInfoName: Strings.INFO,
    image,
  };

  // return
  return (
    <UrlCopyPage
      { ...props }
      pageTitle={Strings.PAGE_TITLE}
      info={Strings.INFO}
      image={image}
      successCopiedModalSetup={successCopiedModalSetup}
      feedPartner={Strings.FEED_PARTNER}
      tutorialLink={Strings.TUTORIAL_LINK}
      tipIndex={1}
    />
  );
};

export default GoogleShopping;
