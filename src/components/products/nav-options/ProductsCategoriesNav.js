import React from 'react';
import { Platform, Alert } from 'react-native';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import { logEvent } from '../../../integrations';
import { KyteToolbar, KyteSafeAreaView } from '../../common';
import { colors } from '../../../styles';
import I18n from '../../../i18n/i18n';
import { checkUserReachedLimit, productDetailCreate, productCategoryDetailCreate, updateshareCatalogModalVisible, setUserAlreadySeenCatalogHelper } from '../../../stores/actions';
import { checkUserPermission, kyteCatalogDomain, generateTestID } from '../../../util';
import ShareCatalogHelper from '../helpers/ShareCatalogHelper';

const ProductsCategoriesNav = (props) => {
  const { navigation, listSize } = props;
  // const { appInfo } = props.user;

  const shareCatalog = () => {
    Share.open({
      title: `${I18n.t('catalogShareSubject')} ${props.store.name}`,
      message: `${I18n.t('catalogShareSubject')} ${props.store.name}`,
      subject: `${I18n.t('catalogShareSubject')} ${props.store.name}`,
      url: `https://${props.store.urlFriendly}${kyteCatalogDomain}`,
    }).then(() => logEvent('CatalogShared'));
  };

  // const configShareCatalog = () => {
  //   const { authVerified, permissions } = props.user;
  //   const hasPermission = (checkUserPermission(permissions).isAdmin || checkUserPermission(permissions).isOwner) && authVerified;

  //   if (hasPermission) {
  //     if (!props.store || (props.store && !props.store.catalog)) {
  //       navigation.navigate('CatalogConfigTutorial');
  //     } else {
  //       props.updateshareCatalogModalVisible(true);
  //     }
  //   } else if (!authVerified) {
  //     Alert.alert(I18n.t('words.s.attention'), I18n.t('catalogConfirmAccountFirst'));
  //   } else if (!props.store || (props.store && !props.store.catalog)) {
  //     Alert.alert(I18n.t('words.s.attention'), I18n.t('catalogTellAdminToConfig'));
  //   } else {
  //     shareCatalog();
  //   }
  // };

  const hasPermission = (checkUserPermission(props.user.permissions).isAdmin || checkUserPermission(props.user.permissions).isOwner) && props.user.authVerified;
  const rightButtons = [
    { icon: 'export',
      onPress: () => props.navigation.navigate('DataExport', { selected: { products: true } }),
      color: colors.primaryColor,
      isHidden: !hasPermission,
      testProps: generateTestID('export-pd'),
    },
  ];

  // const renderPointer = () => {
  //   const handlePress = () => {
  //     if (!props.store || (props.store && !props.store.catalog)) {
  //       navigation.navigate('CatalogConfigTutorial');
  //       props.setUserAlreadySeenCatalogHelper(true);
  //       props.updateshareCatalogModalVisible(false);
  //       return;
  //     }

  //     props.setUserAlreadySeenCatalogHelper(true);
  //     props.updateshareCatalogModalVisible(true);
  //   };

  //   if (hasPermission && (!appInfo || !appInfo.alreadySeenCatalogHelper)) {
  //     return (
  //       <ShareCatalogHelper
  //         backgroundColor="#FFFFFF"
  //         onPress={() => handlePress()}
  //       />
  //     );
  //   }

  //   return null;
  // };

  return (
		<KyteToolbar
			borderBottom={0}
			headerTitle={`${I18n.t('productsTabProductsLabel')} (${listSize})`}
			navigate={navigation.navigate}
			navigation={navigation}
			rightButtons={rightButtons}
		/>
		// {/* {renderPointer()} */}
	)
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  userHasReachedLimit: state.common.userHasReachedLimit,
  store: state.auth.store,
  shareCatalogModalVisible: state.products.shareCatalogModalVisible,
  listSize: state.products.innerListSize,
});

export default connect(mapStateToProps, { updateshareCatalogModalVisible, checkUserReachedLimit, productDetailCreate, productCategoryDetailCreate, setUserAlreadySeenCatalogHelper })(ProductsCategoriesNav);
