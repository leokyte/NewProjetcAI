import React, { useState, useEffect }  from 'react';
import { connect } from 'react-redux';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment/min/moment-with-locales';

import { KyteButton, KyteIcon } from './';
import { colors, scaffolding } from '../../styles';
import I18n from '../../i18n/i18n';
import { KyteModal } from './KyteModal';
import { ActionButton } from './ActionButton';
import { KyteProLabel } from './KyteProLabel';
import { checkFeatureIsAllowed } from '../../stores/actions';
import { bindActionCreators } from 'redux';

const FilterRangePeriodComponent = (props) => {
  const [ startDate, setStartDate ] = useState(props.startDate);
  const [ endDate, setEndDate ] = useState(props.endDate);
  const [ dateType, setDateType ] = useState(null);

  const [ selectedDate, setSelectedDate ] = useState(moment());
  const [ isModalVisible, setModalVisibility ] = useState(false);

  useEffect(() => {
    setStartDate(props.startDate);
    setEndDate(props.endDate);
  }, [props.startDate, props.endDate]);

  const renderDatePicker = () => {
    return (
      <DateTimePicker
        display={Platform.OS === 'android' ? 'default' : 'spinner'}
        mode="date"
        value={selectedDate.toDate()}
        onChange={(event, date) => {
          const momentDate = moment(date);
          if (momentDate.unix() > moment().unix()) {
            if (Platform.OS === 'ios') return;
            return setModalVisibility(false);
          }

          if (Platform.OS === 'android') return handleDateChange(date);
          setSelectedDate(momentDate);
        }}
      />
    );
  };

  const handleDateChange = (date = selectedDate) => {
    if (Platform.OS === 'android') setModalVisibility(false);

    const d = moment(date);
    setSelectedDate(d);

    if (dateType === 'start') {
      setStartDate(d);
      props.setStartDate(d);
    }
    if (dateType === 'end') {
      setEndDate(d);
      props.setEndDate(d);
    }
  };

  const renderDatePickerModal = () => {
    if (Platform.OS === 'android') {
      return renderDatePicker();
    }

    return (
      <KyteModal bottomPage height="auto" isModalVisible>
        <View style={{ marginBottom: 10}}>
          {renderDatePicker()}
          <ActionButton
            onPress={() => {
              handleDateChange();
              setModalVisibility(false);
            }}
          >
            {I18n.t('salesPeriodConfirmLabel')}
          </ActionButton>
        </View>
      </KyteModal>
    );
  };

  const renderRemoveButton = (removeDateType) => {
    const handleOnPressRemove = () => {
      if (removeDateType === 'start') {
        props.setStartDate('');
        return setStartDate('');
      }

      props.setEndDate('');
      setEndDate('');
    };

    return (
      <KyteButton
        onPress={() => handleOnPressRemove()}
        height={40}
        width={40}
        background="transparent"
      >
        <KyteIcon size={14} name="close-navigation" color={colors.primaryColor} />
      </KyteButton>
    );
  };

  const renderProLabel = () => {
    return (
      <View style={s.proLabelBlock}>
        <KyteProLabel />
      </View>
    );
  };

  const renderHistoryIcon = () => {
    return (
      <View style={{ position: 'absolute', left: -30, bottom: 0 }}>
        <KyteIcon name="history" style={s.periodHeaderTitle} />
      </View>
    );
  };

  const handleOnPress = (dateType) => {
    setModalVisibility(true);
    setDateType(dateType);
  };

  const selectedStartDate = startDate ? moment(startDate).format('ll') : I18n.t('filterSetPeriodStart');
  const selectedEndDate = endDate ? moment(endDate).format('ll') : I18n.t('filterSetPeriodEnd');

  return (
    <View style={s.rangePeriodContainer}>
      <View style={s.periodHeader}>
        {renderHistoryIcon()}
        <Text style={s.periodHeaderTitle}>{I18n.t('filterCustomPeriod')}</Text>
        {props.showProLabel ? renderProLabel() : null}
      </View>
      <View style={[s.periodBlock, props.showProLabel ? scaffolding.disabled : null]}>
        <TouchableOpacity
          onPress={props.premiumCheck ?
            () => props.checkFeatureIsAllowed(props.premiumCheck, () => handleOnPress('start'), props.remoteKey) :
            () => handleOnPress('start')
          }
          style={s.periodItem}
        >
          <Text style={s.periodItemText}>{selectedStartDate}</Text>
        </TouchableOpacity>
        {!!startDate ? renderRemoveButton('start') : null }
      </View>

      <View style={[s.periodBlock, props.showProLabel ? scaffolding.disabled : null]}>
        <TouchableOpacity
          onPress={props.premiumCheck ?
            () => props.checkFeatureIsAllowed(props.premiumCheck, () => handleOnPress('end'), props.remoteKey) :
            () => handleOnPress('end')
          }
          style={s.periodItem}
        >
          <Text style={s.periodItemText}>{selectedEndDate}</Text>
        </TouchableOpacity>
        {!!endDate ? renderRemoveButton('end') : null }
      </View>
      {isModalVisible ? renderDatePickerModal() : null}
    </View>
  );
};

const s = {
  rangePeriodContainer: {
    height: 220,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodHeader: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  periodHeaderTitle: {
    fontFamily: 'Graphik-Medium',
    color: colors.primaryColor,
    fontSize: 18,
    marginBottom: 5,
  },
  periodBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: colors.primaryColor,
    minWidth: '60%',
  },
  periodItemText: {
    fontFamily: 'Graphik-Light',
    textAlign: 'center',
    color: colors.primaryColor,
    fontSize: 26,
  },
  proLabelBlock: {
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    top: 0,
    right: -45,
  },
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({ checkFeatureIsAllowed }, dispatch),
});

const FilterRangePeriod = connect(null, mapDispatchToProps)(FilterRangePeriodComponent);
export { FilterRangePeriod };
