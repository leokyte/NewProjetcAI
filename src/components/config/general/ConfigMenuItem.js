import React from "react"
import { View, TouchableOpacity } from 'react-native'
import { KyteIcon, KytePro, KyteText } from "@kyteapp/kyte-ui-components"
import { colors } from '../../../styles'
import { KyteTagComingSoon } from "../../common/KyteTagComingSoon"
import { KyteTagNew } from "../../common"

const ConfigMenuItem = (menu, billing, openModalWebview) => {

  const renderSubtitle = (label, status) => (
    <KyteText color={!status ? colors.grayBlue : colors.actionDarkColor} size={styles.labelTextSize - 2} weight="Medium">
      {label.toUpperCase()}
    </KyteText>
  )

  const renderDescription = (description) => (
    <KyteText marginTop={10} size={12}>
      {description}
    </KyteText>
  )

  const renderItem = (isFree) => {
    const tagProActive = menu?.feature?.isPaid && isFree
    return (
      <View style={{ opacity: menu.disabled ? 0.4 : 1}}>
        <View style={styles.innerContainer}>
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <KyteText pallete="primaryDarker" size={styles.labelTextSize} weight="Semibold">
              {menu.label}
            </KyteText>
            {menu.comingSoon && <KyteTagComingSoon style={{ marginLeft: 10 }} />}
            {menu.isNewCatalogFeature && <KyteTagNew style={styles.tagNew} isFromNewCatalog />}
          </View>
          {!tagProActive && (
            <>
              {menu.subtitle && renderSubtitle(menu.subtitle, menu.status)}
              <KyteIcon name="arrow-cart" size={10} style={{ marginLeft: 20 }} />
            </>
          )}
        </View>
        {menu.description && !tagProActive && renderDescription(menu.description)}
      </View>
    )
  }

  const renderComponentItself = (isFree) => !menu.disabled ? (
      <TouchableOpacity onPress={() => menu.action()} key={menu.index} style={styles.itemContainer}>
        {renderItem(isFree)}
      </TouchableOpacity>
  ) : (
      <View style={styles.itemContainer}>
        {renderItem(isFree)}
      </View>
    )

  if (menu.feature) {
    return (
      <KytePro
        key={menu.index}
        billing={billing}
        feature={menu.feature}
        component={(isFree) => renderComponentItself(isFree)}
        onPressFree={() => openModalWebview(menu.feature.infoURL)}
      />
    )
  }

  return renderComponentItself(false)
}

const styles = {
	switchSection: {
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 20,
		borderBottomColor: colors.borderlight,
		borderBottomWidth: 1,
	},
	itemContainer: {
		paddingVertical: 20,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.borderlight,
		justifyContent: 'center',
	},
	innerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
  labelTextSize: 14,
  tagNew: { 
    marginLeft: 8,
    borderRadius: 24, 
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: 'center', 
    display: 'flex'
  }
}

export default ConfigMenuItem
