import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { checkIsParentProduct, renderProductVariationsName } from '@kyteapp/kyte-utils';
import { checkIsProductAVariant, generateTestID } from '../../../util';
import { CurrencyText, KyteIcon, KyteText } from '../../common';
import { colors } from '../../../styles';
import KyteImageGallery from '../../common/KyteImageGallery';

// Props:
//    - imageHeight

const ProductQuickViewContent = (props) => {
  const { product } = props;
  const [galleryIndex, setGalleryIndex] = useState(props.galleryIndex || 0);
  const [imageContainerWidth, setImageContainerWidth] = useState(0);

  const hasVariants = checkIsProductAVariant(product);
  const isParentProduct = checkIsParentProduct(product);
  const isVariantProduct = hasVariants && !isParentProduct;
  const hasPromotionalVariantPrice = product.unitValue < product.salePrice;

  const hasPromotionalPrice = isVariantProduct ? hasPromotionalVariantPrice : Number.isFinite(product.salePromotionalPrice);

  //
  // PRODUCT CODE handler
  //
  const renderProductCode = (code) => (
      <Text style={style.codeText} numberOfLines={1} {...generateTestID('code-pdck')}>
        {`COD. ${code}`}
      </Text>
    );

  //
  // IMAGE handler
  //

  const getImageHeight = (event) => {
    const { width } = event.nativeEvent.layout;
    setImageContainerWidth(width);
  };

  const renderQuickViewImage = () => {
    const imageVariant = product.image.split('%2F').pop().split('?')[0];
    const imageUrl = isVariantProduct ? imageVariant : product.image;
    const gallery = [imageUrl];
    if (!!props.product.gallery && props.product.gallery.length) {
      props.product.gallery.forEach((g) => gallery.push(g.url));
    }
    const itemWidth = props.itemWidth || imageContainerWidth;
    return (
      <KyteImageGallery
        product={props.product}
        gallery={gallery}
        initialIndex={galleryIndex}
        resizeMode="cover"
        onBeforeChangeImage={(index) => {
          if (props.onBeforeChangeImage) props.onBeforeChangeImage(index);
        }}
        onChangeImage={(index) => {
          setGalleryIndex(index);
          if (props.onChangeImage) props.onChangeImage(index);
        }}
        itemWidth={itemWidth}
      />
    );
  };

  const renderQuickViewNoImage = () => {
    // Free image load
    if (props.isShare) props.onImageLoaded();

    return (
      <View style={[style.imageView(props.imageHeight), style.noImageView]}>
        <KyteIcon name="no-picture" size={90} color={colors.disabledIcon} />
      </View>
    );
  };

  const renderPrice = () => {
    if (hasPromotionalPrice) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <KyteText testProps={generateTestID('promo-pdck')}>
            <CurrencyText style={style.currencyText} value={isVariantProduct ? product.unitValue : product.salePromotionalPrice} />
          </KyteText>
          <KyteText
            lineThrough
            pallete="grayBlue"
            size={14}
            style={{ paddingLeft: 7 }}
            testProps={generateTestID('price-pdck')}
          >
            <CurrencyText value={product.salePrice} />
          </KyteText>
        </View>
      );
    }

    return (
      <KyteText testProps={generateTestID('price-pdck')}>
        <CurrencyText style={style.currencyText} value={product.salePrice} />
      </KyteText>
    );
  };

  //
  // MAIN return
  //
  const renderCategory = () => (
    <View>
      <Text style={style.categoryText} {...generateTestID('cat-pdck')}>
        {product.category.name || product.category}
      </Text>
    </View>
  );

  return (
    <View style={style.contentView}>
      {/* Image */}
      <View onLayout={getImageHeight} style={style.imageView(props.imageHeight)}>
        {product.image || (product.gallery && product.gallery.length)
          ? renderQuickViewImage()
          : renderQuickViewNoImage()}
      </View>

      <View style={style.infoView}>
        {/* Title */}
        <View>
          <Text style={style.titleText} {...generateTestID('prod-name-pdck')}>
            {product.name}
          </Text>
        </View>
        {isVariantProduct && (
          <View>
            <Text style={style.variantNameText} {...generateTestID('prod-variant-name-pdck')}>
              {renderProductVariationsName(product)}
            </Text>
          </View>
        )}

        {/* Category, if exists */}
        {!!product.category && product.category ? renderCategory() : null}

        {/* Price and Code */}
        <View style={[style.priceAndCodeView, { flexDirection: 'row', alignItems: 'center' }]}>
          {renderPrice()}
          {product.code ? renderProductCode(product.code) : null}
        </View>

        {/* Description */}
        <View style={style.descriptionView}>
          <Text style={style.descriptionText} {...generateTestID('desc-pdck')}>
            {product.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

//
// STYLE
//

// Image Default Height
const defaultHeight = 200;

const style = {
  imageView: (height = defaultHeight) => ({
    height,
  }),
  infoView: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleText: {
    color: colors.secondaryBg,
    fontSize: 20,
    fontFamily: 'Graphik-Medium',
  },
  variantNameText: {
    color: colors.tipColor,
    fontSize: 14,
    paddingTop: 4,
    fontFamily: 'Graphik-Medium',
  },
  categoryText: {
    color: colors.grayBlue,
    fontSize: 14,
    fontFamily: 'Graphik-Regular',
  },
  priceAndCodeView: {
    paddingTop: 20,
  },
  priceAndCodeViewInternal: {
    flexDirection: 'row',
  },
  currencyText: {
    color: colors.actionColor,
    fontSize: 24,
    fontFamily: 'Graphik-Medium',
  },
  codeText: {
    color: colors.grayBlue,
    fontSize: 12,
    fontFamily: 'Graphik-Regular',
    flex: 1,
    textAlign: 'right',
    paddingLeft: 5,
  },
  descriptionView: {
    paddingTop: 15,
  },
  descriptionText: {
    lineHeight: 28,
    fontFamily: 'Graphik-Regular',
    fontSize: 14,
  },
  zoomIcon: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 50,

    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageView: {
    backgroundColor: '#eff1f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentView: {
    backgroundColor: 'white',
  },
};

export default ProductQuickViewContent;
