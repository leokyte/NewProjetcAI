import React from "react"
import { Container, colors } from "@kyteapp/kyte-ui-components"
import { CurrencyText } from "../common"

const ProductPrice = ({ salePrice, salePromotionalPrice }: { salePrice: number, salePromotionalPrice?: number | null }) => { 
  const isDiffPrice = salePromotionalPrice !== salePrice
  const price = salePromotionalPrice ?? salePrice
  
  return (
    <Container>
      {Boolean(salePromotionalPrice != null && isDiffPrice) && (
        <CurrencyText style={{
        textDecorationLine: 'line-through',
        fontFamily: 'Graphik-Regular',
        fontSize: 11,
        color: colors.gray05,
        marginRight: 10,
        textAlign: 'right',
        width: "100%",
        marginBottom: 4
        }} value={salePrice} />
      )}
      <CurrencyText style={{ fontSize: 14, textAlign: "right", fontWeight: "500" }} numberColor={colors.gray02Kyte} value={price} />
    </Container>
  )
}

export default ProductPrice
