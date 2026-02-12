import React, { useEffect, useState } from "react";
import ProductPhotoSelector from "../../../detail/ProductPhotoSelector";
import { KyteModal, LoadingCleanScreen } from "../../../../common";
import { updateVariationPhoto } from "../../../../../util";
import { DetailOrigin } from "../../../../../enums";
import { IParentProduct, IVariation } from "@kyteapp/kyte-utils";
import { productManagementSetValue, productSave, setSelectedVariationForPhotoEdit, updateProductDetailState } from "../../../../../stores/actions";
import { connect } from "react-redux";
import { RootState } from "../../../../../types/state/RootState";
import { logEvent } from "../../../../../integrations";

interface VariantPhotoSelectorModalProps { 
  isVisible: boolean;
  onClose: () => void;
  product?: IParentProduct;
  selectedVariationForPhotoEdit: IVariation;
  variantImage?: string;
  productSave: typeof productSave
  updateProductDetailState: typeof updateProductDetailState
  productManagementSetValue: typeof productManagementSetValue
}

const VariantPhotoSelectorModal = ({ isVisible, onClose, product, variantImage, productSave, updateProductDetailState, selectedVariationForPhotoEdit }: VariantPhotoSelectorModalProps) => { 
  const [photoSelectorLoading, setPhotoSelectorLoading] = useState(false)

  const handleVariationPhotoSave = (mainPhoto: string) => {
		setPhotoSelectorLoading(true)

		// Create a new product object with updated variations
		const newProduct = {
			...product,
			variations: updateVariationPhoto({
				variations: product?.variations,
				selectedVariationForPhotoEdit,
				image: mainPhoto,
			}),
		}
		
		productSave(newProduct, (responseProduct: IParentProduct) => {
			updateProductDetailState(responseProduct, DetailOrigin.UPDATE)
			onClose()
      setPhotoSelectorLoading(false)
      logEvent('Product Option Photo Save', {hasImage: Boolean(mainPhoto)})
		})
  }

  useEffect(() => {
    return () => {
      setSelectedVariationForPhotoEdit(null)
      productManagementSetValue('', 'productPhoto')
    }
  }, [])
  
  return (
    <KyteModal
      height="100%"
      fullPage
      isModalVisible={isVisible}
    >
      <ProductPhotoSelector
        {...{} as any}
        events={{
          removeMainPhotoEvent: () => logEvent('Product Option Photo Remove'),
          alertEvent: () => logEvent('Product Option Photo Alert'),
        }}
        productMainImage={variantImage}
        hideGallery={true}
        handleExternalSave={(mainPhoto: string) => handleVariationPhotoSave(mainPhoto)}
        handleClose={onClose}
        isModal={true}
      />
      {photoSelectorLoading ? <LoadingCleanScreen /> : null}
    </KyteModal>
  )
}

const mapStateToProps = ({ products }: RootState) => ({
  selectedVariationForPhotoEdit: products.selectedVariationForPhotoEdit,
})

export default connect(mapStateToProps, {
  productSave,
  updateProductDetailState,
  setSelectedVariationForPhotoEdit,
  productManagementSetValue
})(VariantPhotoSelectorModal)
