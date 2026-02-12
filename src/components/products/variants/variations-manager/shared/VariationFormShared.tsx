import React from 'react'
import { TouchableOpacity } from 'react-native'
import Container from '@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container'
import Padding from '@kyteapp/kyte-ui-components/src/packages/scaffolding/padding/Padding'
import Margin from '@kyteapp/kyte-ui-components/src/packages/scaffolding/margin/Margin'
import colors from '@kyteapp/kyte-ui-components/src/packages/styles/colors'
import Body14 from '@kyteapp/kyte-ui-components/src/packages/text/typography/body14/Body14'
import KyteIcon from '@kyteapp/kyte-ui-components/src/packages/icons/KyteIcon/KyteIcon'
import KyteButton from '@kyteapp/kyte-ui-components/src/packages/buttons/kyte-button/KyteButton'
import { Input } from '../../../../common/Input'
import { VariationDraggableFlatlist } from '../VariationDraggableFlatlist'
import { VariationFormOption } from '../../../../../stores/variants/actions/variation-form.actions'
import I18n from '../../../../../i18n/i18n'

interface VariationNameSectionProps {
  variationName: string
  placeholder: string
  onPress: () => void
}

export const VariationNameSection: React.FC<VariationNameSectionProps> = ({
  variationName,
  placeholder,
  onPress
}) => (
  <TouchableOpacity onPress={onPress}>
    <Container backgroundColor={colors.white} pointerEvents="none" marginBottom={8}>
      <Padding all={16}>
        <Input 
          placeholder={placeholder} 
          value={variationName} 
          editable={false}
        />
      </Padding>
    </Container>
  </TouchableOpacity>
)

interface VariationOptionsSectionProps {
  options: VariationFormOption[]
  onOrderChange: (hasChanges: boolean, updatedVariations: any[]) => void
  onOptionPress: (option: VariationFormOption) => void
  onAddOptionPress: () => void
  optionsLabel: string
  addOptionLabel: string
}

export const VariationOptionsSection: React.FC<VariationOptionsSectionProps> = ({
  options,
  onOrderChange,
  onOptionPress,
  onAddOptionPress,
  optionsLabel,
  addOptionLabel
}) => {
  const renderFooterComponent = () => (
    <TouchableOpacity onPress={onAddOptionPress}>
      <Padding all={16}>
        <Container flexDirection="row" alignItems="center" justifyContent="space-between">
          <Margin left={8}>
            <Body14 color={colors.green03Kyte} style={{ fontSize: 14 }} weight={500}>
              {addOptionLabel}
            </Body14>
          </Margin>
          <KyteIcon name="plus-calculator" size={13} color={colors.green03Kyte} style={{ marginLeft: 8 }} />
        </Container>
      </Padding>
    </TouchableOpacity>
  )

  return (
    <Container flex={1} backgroundColor={colors.white}>
      <Padding all={16}>
        <Body14 weight={500}>{optionsLabel}</Body14>
      </Padding>
      <Container flex={1}>
        <VariationDraggableFlatlist
          key={JSON.stringify(options)}
          variations={options || []}
          onOrderChange={onOrderChange}
          renderFooterComponent={renderFooterComponent()}
          onPress={(item) => onOptionPress({
            id: item.id || '',
            title: item.title || '',
          })}
        />
      </Container>
    </Container>
  )
}

interface VariationSaveButtonProps {
  canSave: boolean
  isLoading: boolean
  onPress: () => void
  buttonText: string
  loadingText?: string
}

const Strings = {
  t_saving: I18n.t('status.saving'),
}

export const VariationSaveButton: React.FC<VariationSaveButtonProps> = ({
  canSave,
  isLoading,
  onPress,
  buttonText,
  loadingText
}) => (
  <Container flex={0} backgroundColor={colors.white}>
    <Padding all={16}>
      <KyteButton
        onPress={onPress}
        type={canSave ? 'primary' : 'tertiary'}
        disabledButton={!canSave || isLoading}
      >
        {isLoading ? (loadingText || Strings.t_saving) : buttonText}
      </KyteButton>
    </Padding>
  </Container>
)