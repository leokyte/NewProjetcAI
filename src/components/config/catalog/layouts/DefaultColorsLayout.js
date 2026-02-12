import React from "react";
import { connect } from "react-redux";
import { View, Image } from 'react-native'
import { TouchableOpacity } from "react-native-gesture-handler";
import { isFree } from '@kyteapp/kyte-ui-components';
import { getInitialColor, isColorCloseToWhite, isColorDefault } from "../../../../util/util-color";
import { colorGrid, colors } from "../../../../styles";
import { isBetaCatalog } from "../../../../util";
import { hasCatalog, setCatalogColor } from "../../../../stores/actions";
import { ColorItem } from "../../../common";
import { ColorButton } from "../../../../../assets/images/catalog/color-button";

const DefaultColorsLayout = (props) => {
  const { storeAccount, hexColor, setTabIndex, handleShowActiveBetaModal, billing } = props
  const { catalog } = storeAccount
  const isBetaActive = isBetaCatalog(catalog?.version)
  const initialColor = getInitialColor(catalog, isBetaActive, isFree(billing))
  const itHasCatalog = props.hasCatalog()
  const isInitialColorDefault = isColorDefault(initialColor)
  const isInitialColorCloseToWhite = isColorCloseToWhite(initialColor)

  const handleClickColorButton = () => {
		if(isBetaActive || !itHasCatalog){
			return setTabIndex(1)
		}
		return handleShowActiveBetaModal()
  }

  return(
    <View style={styles.colorsMap}>
      {colorGrid.map((color, i) => (
        <ColorItem
          key={i} 
          itemColor={color.foreground} 
          itemHeight={36} 
          style={styles.colorItem} 
          onPress={(color) => props.setCatalogColor(color)} 
          isActive={hexColor === color.foreground}
        />
      ))}

      {!isInitialColorDefault && itHasCatalog && (
        <ColorItem
          key={initialColor}
          itemColor={initialColor}
          isActive={initialColor === hexColor}
          itemHeight={36} 
          iconColor={isInitialColorCloseToWhite ? colors.lightGrey : '#FFF'}
          style={{...styles.colorItem, borderWidth: isInitialColorCloseToWhite ? 1 : 0, borderColor: isInitialColorCloseToWhite ? colors.lightGrey : 'transparent'}} 
          onPress={(color) => props.setCatalogColor(color)}
        />
      )}

        <TouchableOpacity
          onPress={() => handleClickColorButton()}
        >
          <Image source={{ uri: ColorButton }} style={{...styles.colorItem, height: 36 }} />
        </TouchableOpacity>
    </View>
  )
}

const styles = {
	colorsMap: {
		width: '100%', 
		flexDirection: 'row', 
		flexWrap: 'wrap', 
		justifyContent: 'center',
	},
	colorItem: {
		width: 36, 
		borderRadius: 8,
		marginHorizontal: 8, 
		marginVertical: 8
	}
  };


export default connect(
    (state) => ({
      hexColor: state.catalog.color,
      storeAccount: state.auth.store,
      billing: state.billing,
    }), { hasCatalog, setCatalogColor }
  )(DefaultColorsLayout);
