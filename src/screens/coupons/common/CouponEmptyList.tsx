import React from 'react'
import { CenterContent, KyteButton } from '../../../components/common'
import { Image, View } from 'react-native'
import DefaultBallon from '../../../../assets/images/common/default-ballons'
import KyteText from '@kyteapp/kyte-ui-components/src/packages/text/kyte-text/KyteText'
import I18n from '../../../i18n/i18n'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import { colors } from '../../../styles'
import { connect } from 'react-redux'

const CouponEmptyList = ({ listPromotion }: { 
  listPromotion: () => void 
}) => (
  <CenterContent>
    <View 
      style={{
        height: '100%',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <View />
      <CenterContent>
        <Image source={{ uri: DefaultBallon, width: 140, height: 140 }} />
        <KyteText size={18} weight={500} lineHeight={25}>{I18n.t("coupons.loadListError")}</KyteText>
        <KyteText size={16} lineHeight={25}>{I18n.t("coupons.loadListErrorSubtitle")}</KyteText>
      </CenterContent>
      
      <Padding all={16} style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.littleDarkGray }}>
        <KyteButton 
          height={48} 
          borderColor={colors.actionColor} 
          backgroundColor={colors.white} 
          borderWidth={1}
          onPress={() => listPromotion()}
        >
          <KyteText size={16} weight={500} color={colors.actionColor}>
            {I18n.t("stockConnectivityStatusButtonIfo")}
          </KyteText>
        </KyteButton>
      </Padding>
    </View>
  </CenterContent>
)

export default connect()(CouponEmptyList)