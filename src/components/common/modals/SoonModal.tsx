import React, { ReactNode } from "react";
import { Container, KyteText, Padding, Margin } from "@kyteapp/kyte-ui-components";
import I18n from "../../../i18n/i18n";
import { ActionButton } from "../ActionButton";
import { colors } from "../../../styles";
import { KyteModal } from "../KyteModal";

const StandardStrings = {
  t_available_soon: I18n.t("availableSoon"),
  t_understood: I18n.t("okUnderstood")
}

interface SoonModalProps { 
  children?: ReactNode;
  isVisible?: boolean;
  strings?: {
    title: string;
  };
  onClose?: () => void;
}

const SoonModal = ({
  children,
  strings,
  onClose,
  isVisible
}: SoonModalProps) => { 
  const PADDING_SIZE = 16;
  
  return (
    <KyteModal
      noPadding
      title={strings?.title}
      height="auto"
      noEdges
      isModalVisible={isVisible}
      hideModal={onClose}
      topRadius={PADDING_SIZE}
      bottomRadius={PADDING_SIZE}
      titleStyle={{
        color: colors.primaryDarker,
      }}
			>
      <Padding horizontal={PADDING_SIZE} bottom={24} top={PADDING_SIZE}>
        <KyteText textAlign="center" size={20} lineHeight={20 * 1.4} weight={500} color={colors.primaryDarker}>{StandardStrings.t_available_soon}</KyteText>
        <Margin bottom={8} />
        {children}
      </Padding>
      <Container borderTopWidth={1} borderColor={colors.lightBorder} paddingTop={PADDING_SIZE} style={{ paddingHorizontal: 8}}>
        <ActionButton onPress={onClose} style={{ marginBottom: PADDING_SIZE }} full={undefined}>{StandardStrings.t_understood}</ActionButton>
      </Container>
      
    </KyteModal>
  )
}

export default SoonModal;
