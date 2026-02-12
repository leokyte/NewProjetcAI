import React, { useEffect, useState } from 'react';
import { View, Linking } from 'react-native';
import { KyteIcon, KyteText } from '@kyteapp/kyte-ui-components';
import * as RNLocalize from 'react-native-localize';

import { kyteTikTokAdsDetails, kyteTiktokAdsCreation } from '../../../../../../services';
import { KyteCard, ActionButton } from '../../../../../common';
import I18n from '../../../../../../i18n/i18n';
import { colors } from '../../../../../../styles';
import { LoadingComponent } from './';
import { logEvent } from '../../../../../../integrations';

export const InfoAccount = ({ aid }) => {
  const Strings = {
    TITLE_BUSINESS: I18n.t('tiktok.TiktokContentIntro.titlebusiness'),
    SUBTITLE_BUSINESS: I18n.t('tiktok.TiktokContentIntro.subtitlebusiness'),
    MANAGER_BUTTON: I18n.t('tiktok.TiktokContentIntro.manageButton'),
    TITLE_ADS: I18n.t('tiktok.TiktokContentIntro.titleAds'),
    SUBTITLE_ADS: I18n.t('tiktok.TiktokContentIntro.subtitleAds'),
    ADS_BUTTON: I18n.t('tiktok.TiktokContentIntro.adsButton'),
    CAMPAIGN: I18n.t('tiktok.TiktokContentIntro.campaign.title'),
    CAMPAIGN_ACTIVE: I18n.t('tiktok.TiktokContentIntro.campaign.active'),
    CAMPAIGN_PAUSED: I18n.t('tiktok.TiktokContentIntro.campaign.paused'),
    CAMPAIGN_NOT_DELIVERING: I18n.t('tiktok.TiktokContentIntro.campaign.notDelivering'),
    CAMPAIGN_COMPLETED: I18n.t('tiktok.TiktokContentIntro.campaign.completed'),
    MANAGER_CAMPAIGN: I18n.t('tiktok.TiktokContentIntro.managerCampaign'),

    STATUS_PENDING: I18n.t('tiktok.TiktokContentIntro.status.pending'),
    STATUS_APPROVED: I18n.t('tiktok.TiktokContentIntro.status.approved'),
    STATUS_SUSPENDED: I18n.t('tiktok.TiktokContentIntro.status.suspended'),

    TEXT_ERROR: I18n.t('tiktok.TiktokContentIntro.errorText'),
    LABEL_ERROR: I18n.t('tiktok.TiktokContentIntro.errorLabel'),
  };

  const [businessAccount, setBusinessAccount] = useState({});
  const [adsAccount, setAdsAccount] = useState({});
  const [adsStatus, setAdsStatus] = useState({});
  const [getDetailsError, setGetDetailsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const statusAds = {
    pending: {
      title: Strings.STATUS_PENDING,
      color: colors.warningColor,
    },
    approved: {
      title: Strings.STATUS_APPROVED,
      color: '#4286F4',
    },
    suspended: {
      title: Strings.STATUS_SUSPENDED,
      color: colors.barcodeRed,
    },
  };

  const linksTiktok = {
    account: 'https://business.tiktok.com/',
    ads: 'https://ads.tiktok.com/i18n/dashboard/',
  };

  const tiktokAdsCreation = async () => {
    try {
      const { data } = await kyteTiktokAdsCreation(aid, RNLocalize.getTimeZone());
      logEvent('TiktokAdCreate');
      Linking.openURL(data);
    } catch (ex) {
      console.log('error tiktokAdsCreation: ', ex);
    }
  };

  const tikTokAdsDetails = async () => {
    setLoading(true);

    try {
      setGetDetailsError(false);
      const { data } = await kyteTikTokAdsDetails(aid);

      setBusinessAccount(data.account_info.bc_info);
      setAdsAccount(data.account_info.ad_account);
      setAdsStatus(data.ads_info);
    } catch (error) {
      setGetDetailsError(true);
      console.log('error tikTokAdsDetails: ', error);
    } finally {
      setLoading(false);
    }
  };

  const openTikTokAdsManager = () => {
    logEvent('TiktokAdManage');
    Linking.openURL(linksTiktok.ads);
  };

  const openTikTokBusiness = () => {
    logEvent('TiktokBusinessManage');
    Linking.openURL(linksTiktok.account);
  };

  useEffect(() => {
    tikTokAdsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.contentView}>
      {loading ? (
        <View style={{ height: 120 }}>
          <LoadingComponent />
        </View>
      ) : getDetailsError ? (
        <View style={{ alignContent: 'center', alignItems: 'center' }}>
          <KyteText size={18} textAlign="center" lineHeight={25} marginBottom={12}>
            {Strings.TEXT_ERROR}
          </KyteText>
          <ActionButton
            leftIcon={<KyteIcon color={colors.white} name="refresh" size={16} />}
            buttonSmall
            full={false}
            style={{ flexDirection: 'row' }}
            onPress={() => tikTokAdsDetails()}
          >
            {Strings.LABEL_ERROR}
          </ActionButton>
        </View>
      ) : (
        <>
          <KyteText size={18} textAlign="center" lineHeight={25} marginBottom={4} weight={500}>
            {Strings.TITLE_BUSINESS}
          </KyteText>
          <KyteText size={14} textAlign="center" lineHeight={21} marginBottom={16}>
            {Strings.SUBTITLE_BUSINESS}
          </KyteText>

          <KyteCard bgColor={colors.borderlight} alignCenter>
            <KyteText size={16} textAlign="center" lineHeight={24} marginBottom={4} weight={500}>
              {businessAccount.name}
            </KyteText>
            <KyteText size={14} textAlign="center" lineHeight={21} marginBottom={16}>
              ID: {businessAccount.id}
            </KyteText>

            <ActionButton
              textStyle={{ fontSize: 14 }}
              buttonSmall
              cancel
              onPress={() => openTikTokBusiness()}
              leftIcon={<KyteIcon color={colors.primaryColor} name="new-tab" size={16} />}
              full={false}
              style={{ flexDirection: 'row' }}
            >
              {Strings.MANAGER_BUTTON}
            </ActionButton>
          </KyteCard>

          <View style={styles.line} />

          <KyteText size={18} textAlign="center" lineHeight={25} marginBottom={4} weight={500}>
            {Strings.TITLE_ADS}
          </KyteText>
          <KyteText size={14} textAlign="center" lineHeight={21} marginBottom={16}>
            {Strings.SUBTITLE_ADS}
          </KyteText>

          <KyteCard bgColor={colors.borderlight} alignCenter>
            <KyteText size={16} textAlign="center" lineHeight={24} marginBottom={4} weight={500}>
              {adsAccount.name}
            </KyteText>
            <KyteText size={14} textAlign="center" lineHeight={21} marginBottom={8}>
              ID: {adsAccount.id}
            </KyteText>

            <View style={styles.flag}>
              <View style={styles.labelSmall}>
                <View
                  style={[styles.circle, { backgroundColor: statusAds[adsAccount.status].color }]}
                />
                <KyteText>{statusAds[adsAccount.status].title}</KyteText>
              </View>
            </View>

            <ActionButton
              textStyle={{ fontSize: 14 }}
              buttonSmall
              onPress={() => tiktokAdsCreation()}
              leftIcon={<KyteIcon color={colors.white} name="new-tab" size={16} />}
              full={false}
              style={{ flexDirection: 'row' }}
            >
              {Strings.ADS_BUTTON}
            </ActionButton>

            <View style={styles.line} />

            <View style={{ width: '100%' }}>
              <View style={styles.label}>
                <View style={[styles.circleIcon, { backgroundColor: colors.actionColor }]}>
                  <KyteIcon color={colors.white} name="check" size={9} />
                </View>
                <KyteText>
                  <KyteText weight={500}>
                    {Strings.CAMPAIGN} {Strings.CAMPAIGN_ACTIVE}:
                  </KyteText>{' '}
                  {adsStatus.active}
                </KyteText>
              </View>
              <View style={styles.label}>
                <View style={[styles.circleIcon, { backgroundColor: colors.warningColor }]}>
                  <KyteText color={colors.white} size={15}>
                    !
                  </KyteText>
                </View>
                <KyteText>
                  <KyteText weight={500}>
                    {Strings.CAMPAIGN} {Strings.CAMPAIGN_PAUSED}:
                  </KyteText>{' '}
                  {adsStatus.paused}
                </KyteText>
              </View>
              <View style={styles.label}>
                <View style={[styles.circleIcon, { backgroundColor: colors.barcodeRed }]}>
                  <KyteIcon color={colors.white} name="close-navigation" size={9} />
                </View>
                <KyteText>
                  <KyteText weight={500}>
                    {Strings.CAMPAIGN} {Strings.CAMPAIGN_NOT_DELIVERING}:
                  </KyteText>{' '}
                  {adsStatus.not_delivering}
                </KyteText>
              </View>
              <View style={styles.label}>
                <View style={[styles.circleIcon, { backgroundColor: '#4286F4' }]}>
                  <KyteIcon color={colors.white} name="check" size={9} />
                </View>
                <KyteText>
                  <KyteText weight={500}>
                    {Strings.CAMPAIGN} {Strings.CAMPAIGN_COMPLETED}:
                  </KyteText>{' '}
                  {adsStatus.completed}
                </KyteText>
              </View>
            </View>

            <ActionButton
              textStyle={{ fontSize: 14 }}
              buttonSmall
              cancel
              onPress={() => openTikTokAdsManager()}
              leftIcon={<KyteIcon color={colors.primaryColor} name="new-tab" size={16} />}
              full={false}
              style={{ flexDirection: 'row', marginTop: 16 }}
            >
              {Strings.MANAGER_CAMPAIGN}
            </ActionButton>
          </KyteCard>
        </>
      )}
    </View>
  );
};

const styles = {
  contentView: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#D9DCE2',
    marginVertical: 24,
  },
  flag: {
    marginBottom: 16,
  },
  circle: {
    borderRadius: 6,
    width: 12,
    height: 12,
    marginRight: 4,
  },
  labelSmall: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  label: {
    backgroundColor: 'white',
    padding: 12,
    flex: 1,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
