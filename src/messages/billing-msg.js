import React from 'react';
import moment from 'moment/min/moment-with-locales';
import { Text, Platform, Linking } from 'react-native';
import { msg } from '../styles';
import { PRO } from '../enums';
import {
  messagePaidFeature,
  messageInTrial,
  messageOutOfTrial,
  messageInTolerance,
  messageOutOfTolerance,
  messageGift,
} from '../../assets/images';
import { checkIsExpired } from '../util';
import I18n from '../i18n/i18n';

const DEFAULT_MODAL_TITLE = I18n.t('plansAndPrices.pageTitle');

const msgInTrial = () => <Text style={msg.title}>{I18n.t('billingMessages.trial.title')}</Text>;
const msgOutOfTrial = () => <Text style={msg.title}>{I18n.t('billingMessages.free.title')}</Text>;

const contentInTrial = (props) => (
  <Text style={msg.content}>
    {I18n.t('billingMessages.trial.content.1')}
    <Text style={msg.highlightText}>
      {' '}
      {props.billing.trialDays}{' '}
      {props.billing.trialDays > 1 ? I18n.t('words.p.days') : I18n.t('words.s.day')}{' '}
    </Text>
    {I18n.t('billingMessages.trial.content.2')}{' '}
    <Text style={msg.highlightText}> Kyte {props.plan.label} </Text>
    {I18n.t('billingMessages.trial.content.3')}
  </Text>
);

const contentOutOfTrial = (props) => (
  <Text style={msg.content}>
    {I18n.t('billingMessages.free.content.1')}{' '}
    <Text style={msg.highlightText}> Kyte {props.plan.label} </Text>
    {I18n.t('billingMessages.free.content.2')}
  </Text>
);

// Subscribe Message
const Pro = {
  newModal: false,
  // image, title, features and content only appears on type "default"
  image: {
    src: () => messagePaidFeature,
    size: 110,
  },
  title() {
    return <Text style={msg.title}>{I18n.t('billingMessages.pro.title')}</Text>;
  },
  cta: I18n.t('billingMessages.ctaDefault'),
  loading: I18n.t('billingMessages.pro.title'),
  content(props) {
    return (
      <Text style={msg.content}>
        {I18n.t('billingMessages.pro.content.1')}
        <Text style={msg.highlightText}> {props.plan.label.toUpperCase()} </Text>
        {I18n.t('billingMessages.pro.content.2')}
      </Text>
    );
  },
};

// Prime Message
const Prime = {
  newModal: false,  
  loading: I18n.t('billingMessages.prime.title'),
};

// Millenium Messages
const millennium = {
  newModal: false,
  image: {
    src: () => messageGift,
    size: 110,
  },
  cta: I18n.t('billingMessages.millennium.cta'),
  ctaShare: true,
  hideFeatures: true,
  loading: I18n.t('billingMessages.millennium.title'),
  title() {
    return <Text style={msg.title}>{I18n.t('billingMessages.millennium.title')}</Text>;
  },
  content() {
    return (
      <Text style={msg.content}>
        {`${I18n.t('billingMessages.millennium.content.1')} `}
        <Text style={msg.highlightText}>{`${I18n.t(
          'billingMessages.millennium.content.2',
        )} `}</Text>
        {`${I18n.t('billingMessages.millennium.content.3')} `}
        <Text style={msg.highlightText}>{`${I18n.t(
          'billingMessages.millennium.content.4',
        )} \n`}</Text>
        {`${I18n.t('billingMessages.millennium.content.5')} `}
      </Text>
    );
  },
};

// Paid Messages
const paid = {
  newModal: false,
  image: {
    src: () => messageGift,
    size: 110,
  },
  cta: I18n.t('billingMessages.paid.cta'),
  ctaShare: true,
  loading: I18n.t('billingMessages.paid.title'),
  title: I18n.t('billingMessages.paid.title'),
  content() {
    return <Text style={msg.content}>{I18n.t('billingMessages.paid.content.1')}</Text>;
  },
};

// Tolerance Messages
const inTolerance = {
  newModal: false,
  loading: I18n.t('plansAndPrices.expiredHero.1'),
  content(props) {
    return (
      <Text style={msg.content}>
        {I18n.t('plansAndPrices.expiredHero.3')}
        <Text style={msg.highlightText}>
          {moment(props.billing.toleranceEndDate).utc().format('L')}
        </Text>
        {I18n.t('plansAndPrices.expiredHero.4')}
      </Text>
    );
  },
  hideFeatures: true,
};

const toleranceExpired = {
  newModal: false,
  // image, title, features and content only appears on type "default"
  image: {
    src: () => messageOutOfTolerance,
    size: 90,
  },
  cta: I18n.t('billingMessages.ctaDefault'),
  title() {
    return <Text style={msg.title}>{I18n.t('billingMessages.toleranceExpired.title')}</Text>;
  },
  loading: I18n.t('billingMessages.toleranceExpired.title'),
  content() {
    return (
      <Text style={msg.content}>
        {I18n.t('billingMessages.toleranceExpired.content.1')}
        <Text style={msg.highlightText}> Kyte FREE. </Text>
        {I18n.t('billingMessages.toleranceExpired.content.2')}
        <Text style={msg.highlightText}> Kyte PRO </Text>
        {I18n.t('billingMessages.toleranceExpired.content.3')}
      </Text>
    );
  },
};

// Free Messages
const free = {
  newModal: false,
  // image, title, features and content only appears on type "default"
  image: {
    src: () => messageOutOfTrial,
    size: 90,
  },
  cta: I18n.t('billingMessages.ctaDefault'),
  loading: I18n.t('billingMessages.free.title'),
  title() {
    return msgOutOfTrial();
  },
  content(props) {
    return contentOutOfTrial(props);
  },
};

const trialEnd = {
  newModal: false,
  // image, title, features and content only appears on type "default"
  image: {
    src: () => messageInTrial,
    size: 90,
  },
  cta: I18n.t('billingMessages.ctaDefault'),
  loading: I18n.t('billingMessages.trialEnd.title'),
  title() {
    return (
      <Text style={msg.title}>{`${I18n.t('billingMessages.trialEnd.title')} \n ${I18n.t(
        'billingMessages.trialEnd.subtitle',
      )}`}</Text>
    );
  },
  content(props) {
    return (
      <Text style={msg.content}>
        {`${I18n.t('billingMessages.trialEnd.content.1')} \n`}
        {I18n.t('billingMessages.trialEnd.content.2')}{' '}
        <Text style={msg.highlightText}> Kyte {props.plan.label} </Text>
        {I18n.t('billingMessages.trialEnd.content.3')}
      </Text>
    );
  },
};

// Trial Messages
const trial = {
  newModal: false,
  image: {
    src: (billing) => {
      return checkIsExpired(billing.endDate) ? messageOutOfTrial : messageInTrial;
    },
    size: 90,
  },
  cta: I18n.t('billingMessages.ctaDefault'),
  loading: I18n.t('billingMessages.free.title'),
  title(props) {
    return checkIsExpired(props.billing.endDate) ? msgOutOfTrial() : msgInTrial();
  },
  content(props) {
    return checkIsExpired(props.billing.endDate) ? contentOutOfTrial(props) : contentInTrial(props);
  },
};

// Free Messages
const featureOnlyPro = {
  newModal: true,
  hideCta: false,
  content: (props) => contentOutOfTrial(props),
};

const isOwnerPro = {
  newModal: true,
  hideCta: true,
  content: (props) => contentOutOfTrial(props),
};

const fullWebview = {
  newModal: true,
  hideCta: true,
  content: (props) => contentOutOfTrial(props),
};

export const billingMessages = {
  Pro,
  Prime,
  millennium,
  trial,
  trialEnd,
  paid,
  free,
  inTolerance,
  toleranceExpired,
  featureOnlyPro,
  isOwnerPro,
  fullWebview,
};
