import React, { useEffect } from 'react'
import { connect } from "react-redux"
import { DetailPage } from "../../components/common"
import { getNormalizedLocale } from "../../util"
import I18n from "../../i18n/i18n"
import { LocaleCodeType } from "@kyteapp/kyte-utils"
import { FirstSlideImgPT, FirstSlideImgEN, FirstSlideImgES } from '../../../assets/images/coupons/first-slide-img'
import { SecondSlideImgPT, SecondSlideImgEN, SecondSlideImgES } from '../../../assets/images/coupons/second-slide-img'
import { ThirdSlideImgPT, ThirdSlideImgEN, ThirdSlideImgES } from '../../../assets/images/coupons/third-slide-img'
import { logEvent } from '../../integrations'
import { colorsPierChart } from '../../styles'
import { OnBoardingCarouselCoupons } from './common/OnboardingCarouselCoupons'

const Strings = {
  PAGE_TITLE: I18n.t("coupons.title"),
  FIRST_TITLE: I18n.t("coupons.onBoarding.couponsArrived"),
  FIRST_PARAGRAPH: I18n.t("coupons.onBoarding.setUpPromotion"),
  SECOND_TITLE: I18n.t("coupons.onBoarding.howDoesItWork"),
  SECOND_PARAGRAPH: I18n.t("coupons.onBoarding.createCouponsForCustomers"),
  THIRD_TITLE: I18n.t("coupons.onBoarding.youInControl"),
  THIRD_PARAGRAPH: I18n.t("coupons.onBoarding.trackYourCouponsPerformance"),
  BUTTON: I18n.t("coupons.onBoarding.createNewCoupon")
}

type Images = {
	primary: { [key in LocaleCodeType]: string },
	secondary: { [key in LocaleCodeType]: string }
	tertiary: { [key in LocaleCodeType]: string }
}

const CouponsOnBoarding = ({ ...props }) => {
  const { navigation } = props
	const locale: LocaleCodeType = getNormalizedLocale(I18n.locale).toUpperCase()

	const images: Images = {
		primary: {
			EN: FirstSlideImgEN,
			PT: FirstSlideImgPT,
			ES: FirstSlideImgES,
		},
		secondary: {
			EN: SecondSlideImgEN,
			PT: SecondSlideImgPT,
			ES: SecondSlideImgES,
		},
		tertiary: {
			EN: ThirdSlideImgEN,
			PT: ThirdSlideImgPT,
			ES: ThirdSlideImgES,
		},
	}

	const carouselData = [
		{
			image: images.primary[locale],
			title: Strings.FIRST_TITLE,
			paragraph: Strings.FIRST_PARAGRAPH,
		},
		{
			image: images.secondary[locale],
			title: Strings.SECOND_TITLE,
			paragraph: Strings.SECOND_PARAGRAPH,
		},
		{
			image: images.tertiary[locale],
			title: Strings.THIRD_TITLE,
			paragraph: Strings.THIRD_PARAGRAPH,
		},
	]

	useEffect(() => {
		logEvent('Coupon Onboarding View')
	}, [])

  return(
    <DetailPage pageTitle={Strings.PAGE_TITLE} goBack={() => navigation.goBack()} style={{ backgroundColor: colorsPierChart[9] }}>
			<OnBoardingCarouselCoupons data={carouselData} />
    </DetailPage>
  )
}

export default connect()(CouponsOnBoarding)