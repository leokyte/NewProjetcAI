import React from 'react';
import moment from 'moment/min/moment-with-locales';
import _ from 'lodash';
import { FilterButton } from '../common';

const StatisticsButton = (props) => {
  const { filter, periods } = props;
  const { periodRange, immutableRange, type, dateFormat } = filter;
  const startDate = new moment(periodRange.startDate);
  const endDate = new moment(periodRange.endDate);
  const futurePeriod = moment(endDate).isSameOrAfter(moment().format(dateFormat));
  const periodTypeItems = _.filter(periods, (item) => item.type === type);

  const getDay = (date) => moment(date).format('DD');
  const getMonth = (date) => moment(date).format('MMMM');
  const getYear = (date) => moment(date).format('YYYY');
  const startDay = getDay(startDate);
  const startMonth = getMonth(startDate);
  const endDay = getDay(endDate);
  const endMonth = getMonth(endDate);
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);

  const durationFormat = (typeVal) => {
    switch (typeVal) {
      case 'day': return 'asDays';
      case 'week': return 'asWeeks';
      case 'year': return 'asYears';
      default: return 'asMonths';
    }
  };

  const durationValue = moment.duration(startDate.diff(moment().startOf(type)))[durationFormat(type)]().toFixed(0);
  const periodHumanized = periodTypeItems[Math.abs(durationValue)];
  const isHumanized = durationValue === '0' || durationValue === '-1';

  const dayTitle = () => {
    if (isHumanized) return `${periodHumanized.description}: ${startDay} ${startMonth}`;
    return `${startDay} ${startMonth}`;
  };

  const weekTitle = () => {
    const isSameMonth = moment(startDate).isSame(endDate, 'month');
    if (isHumanized) return periodHumanized.description;
    if (isSameMonth) return `${startDay} - ${endDay} ${startMonth}`;
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const monthTitle = () => {
    if (isHumanized) return `${periodHumanized.description}: ${startMonth} ${startYear}`;
    return `${startMonth} ${startYear}`;
  };

  const yearTitle = () => {
    if (isHumanized) return `${periodHumanized.description}: ${startYear}`;
    return `${startYear}`;
  };

  const renderPeriodTitle = () => {
    switch (type) {
      case 'day': return dayTitle();
      case 'week': return weekTitle();
      case 'year': return yearTitle();
      default: return monthTitle();
    }
  };

  const renderRangeTitle = () => {
    return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
  };

  return (
    <FilterButton
      title={!immutableRange ? renderPeriodTitle() : renderRangeTitle()}
      titleOnClick={() => props.titleOnClick()}
      forwardOnClick={() => props.filterOnClick('add')}
      backwardOnClick={() => props.filterOnClick('subtract')}
      disabledBackwardOnClick={immutableRange}
      disabledForwardOnClick={immutableRange || futurePeriod}
    />
  );
};

export default StatisticsButton;
