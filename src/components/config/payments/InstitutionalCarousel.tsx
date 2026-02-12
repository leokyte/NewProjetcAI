import React, { useEffect, useRef, useState } from 'react'
import OnboardingCarousel from '../../common/OnboardingCarousel'
import I18n from '../../../i18n/i18n'
import { getNormalizedLocale } from '../../../util'
import {
	FirstInstitutionalEN,
	FirstInstitutionalES,
	FirstInstitutionalPT,
	SecondInstitutionalEN,
	SecondInstitutionalES,
	SecondInstitutionalPT,
} from '../../../../assets/images'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import { colors } from '../../../styles'
import { logEvent } from '../../../integrations'
const OnboardingCarouselIgnoredType: any = OnboardingCarousel

const Strings = {
	BUTTON_STEP: I18n.t('words.s.proceed'),
	BUTTON_AGREE: I18n.t('understandAndAgree'),
	FIRST_TITLE: I18n.t('institutional.first.title'),
	FIRST_PARAGRAPH: I18n.t('institutional.first.paragraph'),
	SECOND_TITLE: I18n.t('institutional.second.title'),
	SECOND_PARAGRAPH: I18n.t('institutional.second.paragraph'),
}

type Images = {
	primary: { [key in Locale]: string },
	secondary: { [key in Locale]: string }
}

interface InstitutionalCarouselProps {
	handleHidden: (hidden: boolean) => void
}

type Locale = 'en' | 'pt' | 'es'

const InstitutionalCarousel = ({ handleHidden }: InstitutionalCarouselProps) => {
	const carouselRef = useRef<{
		snapToNext: () => void
		snapToPrev: () => void
		snapToItem: (index: number) => void
		activeDotIndex: number
	}>(null)
	const [activeSlide, setActiveSlide] = useState(0)
	const locale: Locale = getNormalizedLocale(I18n.locale)

	const images: Images = {
		primary: {
			en: FirstInstitutionalEN,
			pt: FirstInstitutionalPT,
			es: FirstInstitutionalES,
		},
		secondary: {
			en: SecondInstitutionalEN,
			pt: SecondInstitutionalPT,
			es: SecondInstitutionalES,
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
	]

	const handleInstitutionalCarousel = (activeSlide: number) => {
		if (activeSlide <= 0) {
			carouselRef.current?.snapToNext()
			return
		}

		handleHidden?.(true)
	}

	useEffect(() => {
		logEvent('Pix QR Code Onboarding View', { onboarding_step: `Step ${activeSlide + 1}` })
	}, [activeSlide])

	return (
		<Container flex={1} backgroundColor={colors.lightBg}>
			<OnboardingCarouselIgnoredType
				hiddenIcon
				ref={carouselRef}
				data={carouselData}
				activeSlide={activeSlide}
				handleSnapItem={(index: number) => setActiveSlide(index)}
				onPress={handleInstitutionalCarousel}
				textButton={activeSlide === carouselData.length - 1 ? Strings.BUTTON_AGREE : Strings.BUTTON_STEP}
			/>
		</Container>
	)
}

export default InstitutionalCarousel
