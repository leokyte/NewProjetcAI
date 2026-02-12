import React from "react"
import Svg, { Rect, Path, Defs, ClipPath, G } from "react-native-svg"
import { Dimensions, Image, View } from "react-native"
import { CouponImg } from "./coupon-img"
import { colors } from "../../../src/styles"

interface CouponSVGProps {
  width?: number
  color?: string
  borderRadius?: number
  sideColor?: string
  sideWidth?: number
}

const screenWidth = Dimensions.get('window').width
const isIPad = screenWidth > 600

export const CouponSVG = ({
  width = 280,
  borderRadius = 13,
  sideColor = colors.white,
  sideWidth = 50,
}: CouponSVGProps) => {
  const notchRadius = isIPad ? 13 : 10
  const sideHeight = isIPad ? 147 : 128
  const cy = sideHeight / 2

  return (
    <View style={{ width: isIPad ? 445 : 370, height: isIPad ? 170 : 150, alignSelf: 'center' }}>
      <Image
        source={{ uri: CouponImg }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />

      <Svg width={width} height={sideHeight} style={{ marginLeft: isIPad ? 10 : 5, position: 'absolute', top: 0 }}>
        <Defs>
          {/* coupon format with cutout */}
          <ClipPath id="clip">
            <Path
              d={`
                M${borderRadius},0 
                H${width - borderRadius}
                A${borderRadius},${borderRadius} 0 0 1 ${width},${borderRadius}
                V${cy - notchRadius}
                A${notchRadius},${notchRadius} 0 0 0 ${width},${cy + notchRadius}
                V${sideHeight - borderRadius}
                A${borderRadius},${borderRadius} 0 0 1 ${width - borderRadius},${sideHeight}
                H${borderRadius}
                A${borderRadius},${borderRadius} 0 0 1 0,${sideHeight - borderRadius}
                V${cy + notchRadius}
                A${notchRadius},${notchRadius} 0 0 0 0,${cy - notchRadius}
                V${borderRadius}
                A${borderRadius},${borderRadius} 0 0 1 ${borderRadius},0
                Z
              `}
            />
          </ClipPath>
        </Defs>

        <G clipPath="url(#clip)">

          {/* left side */}
          <Rect x="0" y="0" width={sideWidth} height={isIPad ? 170 : 130} fill={sideColor} />
        </G>
      </Svg>
    </View>
  )
}
