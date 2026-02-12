import React from 'react';
import UrlCopyPage from '../templates/UrlCopyPage';
import I18n from '../../../../i18n/i18n';
import { InstagramPageImage } from '../../../../../assets/images';

const Strings = {
  PAGE_TITLE: 'Facebook/Instagram Shopping',
  INFO: 'Facebook',
  LANG: I18n.t('fbIntegration.imageCode'),
  PARTNER_NAME: 'Facebook Shopping',
  PARTNER_SETUP_LINK: I18n.t('instagramSetupLink'),
  FEED_PARTNER: 'instagram',
  TUTORIAL_LINK: I18n.t('instagramTutorialLink'),
};

const Instagram = (props) => {
  // set image
  const image = {
    src: InstagramPageImage(Strings.LANG),
    style: { height: 198, width: 198 },
  };

  const successCopiedModalSetup = {
    partnerLink: Strings.PARTNER_SETUP_LINK,
    partnerName: Strings.PARTNER_NAME,
    partnerInfoName: Strings.PARTNER_NAME,
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
      tipIndex={0}
    />
  );
};

export default Instagram;
