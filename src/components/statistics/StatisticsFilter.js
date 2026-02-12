import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment/min/moment-with-locales';
import { scaffolding } from '../../styles';
import { ActionButton, KyteToolbar, FilterPeriod, FilterRangePeriod, KyteSafeAreaView } from '../common';
import { Period, toList, Features } from '../../enums';
import { periodTypeSet, periodRangeSet, statisticsFetch, checkFeatureIsAllowed, checkPlanKeys } from '../../stores/actions';
import I18n from '../../i18n/i18n';
import { billingCheckAnalyticsPeriod } from '../../util';
import { logEvent } from '../../integrations';

class StatisticsFilter extends Component {
  static navigationOptions = () => {
    return {
      header: null,
    };
  };

  constructor(props) {
    super(props);
    const { key, remoteKey } = Features.items[Features.ANALYTICS];
    const { immutableRange, periodRange } = props.filter;
    const startDate = moment(periodRange.startDate).toDate();
    const endDate = moment(periodRange.endDate).toDate();

    this.state = {
      startDate: immutableRange ? startDate : null,
      endDate: immutableRange ? endDate : null,
      periods: [],
      calendarModalVisible: false,
      selectedCalendarType: '',
      calendarSelectedDate: moment(),
      isAllowed: false,
      featureKey: key,
      remoteKey,
    };
  }

  UNSAFE_componentWillMount() {
    const periods = toList(Period);
    this.setState({ periods: periods.slice(1, periods.length) });
    this.checkKeys();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.statisticsFetch(nextProps);
  }

  setPeriod(type, selected, subtract) {
    const { goBack } = this.props.navigation;
    this.props.periodTypeSet(type, selected, subtract);
    logEvent('StatisticsDateFilterChange');
    goBack();
  }

  setStartDate(date) {
    this.setState({ startDate: date });
  }

  setEndDate(date) {
    this.setState({ endDate: date });
  }

  hideCalendarModal() {
    this.setState({ calendarModalVisible: false });
  }

  async checkKeys() {
    if (await this.props.checkPlanKeys(this.state.featureKey)) {
      this.setState({ isAllowed: true });
    }
  }

  statisticsFetch(nextProps) {
    const { periodRange } = nextProps.filter;
    this.props.statisticsFetch(periodRange.startDate, periodRange.endDate);
  }

  checkPremium(type, selected, subtract) {
    if (billingCheckAnalyticsPeriod(selected)) {
      this.setPeriod(type, selected, subtract);
    } else {
      this.props.checkFeatureIsAllowed(this.state.featureKey, () => this.setPeriod(type, selected, subtract), this.state.remoteKey);
    }
  }

  applyPeriodRange() {
    const { goBack } = this.props.navigation;
    const { startDate, endDate } = this.state;
    const { dateFormat } = this.props.filter;

    this.props.periodRangeSet(moment(startDate).format(dateFormat), moment(endDate).format(dateFormat));
    goBack();
  }

  renderFilterShortcuts() {
    const { selectedPeriod } = this.props.filter;
    const { startDate, endDate } = this.state;
    const rangePeriod = !!startDate || !!endDate;
    return (
      <FilterPeriod
        selectedPeriod={!rangePeriod ? selectedPeriod : null}
        periods={this.state.periods}
        onPress={this.checkPremium.bind(this)}
        notPro={!this.state.isAllowed}
        no30Days
      />
    );
  }

  renderButton() {
    const { bottomContainer } = scaffolding;
    const { startDate, endDate } = this.state;
    const disabledButton = () => {
      return (!startDate || !endDate);
    };

    return (
      <View style={[bottomContainer, { paddingTop: 3 }]}>
        <ActionButton
          alertTitle=''
          alertDescription={I18n.t('salesPeriodEmptyAlertDescription')}
          onPress={() => this.applyPeriodRange()}
          disabled={disabledButton()}
        >
          {I18n.t('salesPeriodApplyButton')}
        </ActionButton>
      </View>
    );
  }

  renderFilterRangePeriod() {
    const { startDate, endDate } = this.state;

    return (
      <FilterRangePeriod
        startDate={startDate}
        endDate={endDate}
        setStartDate={this.setStartDate.bind(this)}
        setEndDate={this.setEndDate.bind(this)}
        premiumCheck={this.state.featureKey}
        remoteKey={this.state.remoteKey}
        showProLabel={!this.state.isAllowed}
      />
    );
  }

  render() {
    const { outerContainer } = scaffolding;
    const { navigation } = this.props;

    return (
      <KyteSafeAreaView style={outerContainer}>
        <KyteToolbar
          innerPage
          borderBottom={1}
          headerTitle={I18n.t('filterDatePageTitle')}
          goBack={() => navigation.goBack()}
          navigate={navigation.navigate}
          navigation={navigation}
          showCloseButton
        />
        <View style={{ flex: 1 }}>
          {this.renderFilterRangePeriod()}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            {this.renderFilterShortcuts()}
          </View>
        </View>
        {this.renderButton()}
      </KyteSafeAreaView>
    );
  }
}

const mapStateToProps = ({ statistics }) => ({
  filter: statistics.filter
});

export default connect(mapStateToProps, { periodTypeSet, periodRangeSet, statisticsFetch, checkFeatureIsAllowed, checkPlanKeys })(StatisticsFilter);
