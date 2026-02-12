import React, { Component } from 'react';
import { View, Text, Alert, Image, Dimensions } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import moment from 'moment/min/moment-with-locales';
import _ from 'lodash';

import { isSmallScreen } from '@kyteapp/kyte-ui-components';
import I18n from '../../../i18n/i18n';
import {
  DetailPage,
  FilterRangePeriod,
  ActionButton,
  KyteModal,
  LoadingCleanScreen,
} from '../../common';
import { Type, colorSet, colors, scaffolding } from '../../../styles';
import { DataExportCsv } from '../../../../assets/images';
import { requestReportExport, checkFeatureIsAllowed } from '../../../stores/actions';
import { Features } from '../../../enums';
import { checkDeviceConnection } from '../../../util';
import { logEvent } from '../../../integrations/Firebase-Integration';

class ReportExport extends Component {
  constructor(props) {
    super(props);

    const today = moment();
    const lastYear = today.clone().subtract(1, 'years');
    const dateCreation = moment(props.store.dateCreation);
    const startDate = dateCreation.unix() > lastYear.unix() ? dateCreation : lastYear;
    const { params = {} } = props.route;
    const { selected = {} } = params;

    this.state = {
      start: startDate.toDate(),
      end: today.toDate(),
      isModalVisible: false,
      options: [
        { name: 'Sale', title: I18n.t('reportExportOptionSales'), selected: selected.sales },
        {
          name: 'Product',
          title: I18n.t('reportExportOptionProducts'),
          selected: selected.products,
        },
        {
          name: 'Customer',
          title: I18n.t('reportExportOptionCustomers'),
          selected: selected.customers,
        },
      ],
    };
  }

  componentDidMount() {
    logEvent('Report Export View')
  }

  setStartDate(date) {
    const { end } = this.state;
    if (!end) {
      this.setState({ start: date });
      return;
    }

    const startMoment = moment(date);
    const endMoment = moment(end);
    if (moment.duration(endMoment.diff(startMoment)).asYears() > 1) {
      setTimeout(
        () =>
          Alert.alert(I18n.t('words.s.attention'), I18n.t('reportExportDateRangeBig'), [
            { text: I18n.t('words.s.ok') },
          ]),
        100,
      );
      return;
    }
    this.setState({ start: date });
  }

  setEndDate(date) {
    const { start } = this.state;
    if (!start) {
      this.setState({ end: date });
      return;
    }

    const startMoment = moment(start);
    const endMoment = moment(date);
    if (moment.duration(endMoment.diff(startMoment)).asYears() > 1) {
      setTimeout(
        () =>
          Alert.alert(I18n.t('words.s.attention'), I18n.t('reportExportDateRangeBig'), [
            { text: I18n.t('words.s.ok') },
          ]),
        100,
      );
      return;
    }
    this.setState({ end: date });
  }

  checkOption(option) {
    const { options } = this.state;
    options.forEach((eachOption, optionIndex) => {
      if (eachOption.name === option.name) {
        options[optionIndex] = { ...eachOption, selected: !eachOption.selected };
      }
    });
    this.setState({ options });
  }

  async generateReports() {
    const { start, end, options } = this.state;
    const startMoment = moment(start);
    const endMoment = moment(end);

    const getConnectionInfo = await checkDeviceConnection();
    if (!getConnectionInfo) {
      return Alert.alert(I18n.t('words.s.attention'), I18n.t('words.m.noInternet'), [{ text: 'OK' }]);
    }

    const selectedOptions = _.filter(options, option => option.selected);
    this.props
      .requestReportExport(
        startMoment.format('YYYYMMDD'),
        endMoment.format('YYYYMMDD'),
        _.values(selectedOptions.map((option) => option.name)),
      )
      .then(() => this.setState({ isModalVisible: true }));
  }

  renderLoader() {
    return <LoadingCleanScreen />;
  }

  renderSuccessModal() {
    const { modalContainer, modalImageContainer, svgImage, modalTextTitle, modalTextMsg } = styles;
    const { bottomContainer } = scaffolding;
    const { goBack } = this.props.navigation;
    const { email } = this.props.user;

    return (
      <KyteModal fullPage={isSmallScreen(this.props.viewport)} height="100%" isModalVisible>
        <View style={[modalContainer]}>
          <View style={modalImageContainer}>
            <Image style={svgImage} source={{ uri: DataExportCsv }} />

            <Text style={modalTextTitle}>{I18n.t('reportExportSuccessTitle')}</Text>

            <Text style={modalTextMsg}>
              {I18n.t('reportExportSuccessMsg')} <Text style={[Type.SemiBold]}>{email}</Text>
            </Text>
          </View>
        </View>

        <View style={[bottomContainer]}>
          <ActionButton onPress={() => goBack()}>{I18n.t('words.s.back')}</ActionButton>
        </View>
      </KyteModal>
    );
  }

  render() {
    const { navigation, loader } = this.props;
    const {
      dateSelectorContainer,
      optionsSelectorContainer,
      checkStyles,
      checkboxText,
      optionsContainer,
      optionsSelectorTitle,
    } = styles;
    const { bottomContainer } = scaffolding;
    const { start, end, isModalVisible, options } = this.state;
    const hasOneOptionSelected = _.find(options, (eachOption) => (eachOption.selected));
    const hasDateSelected = start && end;
    const { key, remoteKey } = Features.items[Features.EXPORT];

    return (
      <DetailPage goBack={() => navigation.goBack()} pageTitle={I18n.t('configMenus.reportExport')}>
        <View style={dateSelectorContainer}>
          <FilterRangePeriod
            startDate={start}
            endDate={end}
            setStartDate={this.setStartDate.bind(this)}
            setEndDate={this.setEndDate.bind(this)}
          />
        </View>
        <View style={optionsSelectorContainer}>
          <Text style={optionsSelectorTitle}>{I18n.t('reportExportOptionSelectorTitle')}</Text>
          <View style={optionsContainer}>
            {options.map((eachOption, optionIndex) => {
              return (
                <CheckBox
                  key={optionIndex}
                  containerStyle={checkStyles}
                  checkedIcon={'check-box'}
                  uncheckedIcon={'check-box-outline-blank'}
                  iconType={'material'}
                  onPress={() => this.checkOption(eachOption)}
                  checkedColor={colors.actionColor}
                  checked={eachOption.selected}
                  title={eachOption.title}
                  textStyle={checkboxText}
                />
              );
            })}
          </View>
        </View>
        <View style={bottomContainer}>
          <ActionButton
            onPress={() =>
              this.props.checkFeatureIsAllowed(key, () => this.generateReports(), remoteKey)
            }
            disabled={!hasOneOptionSelected || !hasDateSelected}
            alertTitle={I18n.t('words.s.attention')}
            alertDescription={I18n.t('reportExportErrorMsg')}
          >
            {I18n.t('reportExportButtonExport')}
          </ActionButton>
        </View>

        {isModalVisible ? this.renderSuccessModal() : null}        
        {loader.visible ? this.renderLoader() : null}
      </DetailPage>
    );
  }
}

const styles = {
  dateSelectorContainer: {
    flex: 1.5,
    justifyContent: 'center',
  },
  optionsSelectorContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  checkboxContainer: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    flexWrap: 'wrap',
  },
  optionsSelectorTitle: [Type.Medium, Type.fontSize(16), colorSet(colors.secondaryBg)],
  checkStyles: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    padding: 0,
    width: '50%',
  },
  checkboxText: [
    Type.Regular,
    colorSet(colors.primaryColor),
    Type.fontSize(14),
    { fontWeight: 'normal' },
  ],
  svgImage: {
    resizeMode: 'contain',
    width: Dimensions.get('window').width * 0.2,
    height: Dimensions.get('window').height * 0.2,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalTextTitle: [
    Type.Regular,
    Type.fontSize(26),
    { lineHeight: 34, textAlign: 'center', color: colors.secondaryBg, paddingTop: 20 },
  ],
  modalTextMsg: [
    Type.Light,
    Type.fontSize(16),
    {
      textAlign: 'center',
      paddingTop: 30,
      lineHeight: 20,
      color: colors.secondaryBg,
    },
  ],
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const mapStateToProps = ({ auth, common }) => {
  const { user, store } = auth;
  const { loader, viewport } = common;

  return { user, store, loader, viewport };
};

export default connect(mapStateToProps, { requestReportExport, checkFeatureIsAllowed })(
  ReportExport,
);
