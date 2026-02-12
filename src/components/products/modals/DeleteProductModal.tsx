import React, { useState } from "react";
import { Container, KyteText, Padding, Margin, Checkbox, Row, Divider } from "@kyteapp/kyte-ui-components";
import I18n from "../../../i18n/i18n";
import { colors } from "../../../styles";
import { ActionButton, KyteModal } from "../../common";
import { Pressable } from "react-native";

const StandardStrings = {
  t_delete_title: I18n.t("product.deleteTitleModal"),
	t_delete_product_text: I18n.t("product.deleteTextModal"),
	t_delete_product_variant_text: (quantity: number) => I18n.t("product.deleteVariantsTextModal", { quantity }),
	t_understand_delete_text: I18n.t("understandDeleteAction"),
	t_understand_and_delete: I18n.t("understandAndExclude"),
	t_cancel: I18n.t("alertDismiss"),
}

interface DeleteProductModalProps {
	isVisible: boolean;
	totalVariantProducts?: number;
	onClose: () => void;
	handleDelete: () => void;
}

const DeleteProductModal = ({
	isVisible,
	totalVariantProducts,
  onClose,
	handleDelete,
}: DeleteProductModalProps) => { 
	const [isUnderstand, setIsUnderstand] = useState(false)
  const PADDING_SIZE = 16;
  
  return (
		<KyteModal
			title=" "
      noPadding
      height="auto"
      noEdges
      isModalVisible={isVisible}
      hideModal={onClose}
      topRadius={PADDING_SIZE}
      bottomRadius={PADDING_SIZE}
			>
      <Padding horizontal={PADDING_SIZE} bottom={24} top={8}>
        <KyteText textAlign="center" size={20} lineHeight={20 * 1.5	} weight={500} color={colors.primaryDarker}>{StandardStrings.t_delete_title}</KyteText>
				<Margin bottom={8} />
				<KyteText textAlign="center" size={16} lineHeight={16 * 1.5} weight={400} color={colors.primaryDarker}>{totalVariantProducts && totalVariantProducts > 0 ? StandardStrings.t_delete_product_variant_text(totalVariantProducts) : StandardStrings.t_delete_product_text}</KyteText>
			</Padding>
			<Divider />
			<Margin bottom={PADDING_SIZE} />
			<Padding horizontal={PADDING_SIZE}>
				<Pressable onPress={() => setIsUnderstand(!isUnderstand)}>
					<Padding vertical={PADDING_SIZE} horizontal={PADDING_SIZE} style={{
						borderRadius: 8,
						backgroundColor: colors.lightBg,
					}}>
						<Row alignItems="center">
							<Checkbox active={isUnderstand} onPress={() => setIsUnderstand(!isUnderstand)} />
							<KyteText lineHeight={12 * 1.5} color={colors.primaryDarker} size={12} style={{
								flexShrink: 1,
							}}>{StandardStrings.t_understand_delete_text}</KyteText>
						</Row>
					</Padding>
				</Pressable>
			</Padding>
			<Margin bottom={PADDING_SIZE} />
			<Container style={{ paddingHorizontal: 8 }}>
				<ActionButton noDisabledAlert color={colors.barcodeRed} disabled={!isUnderstand} onPress={handleDelete}  full={undefined}>{StandardStrings.t_understand_and_delete}</ActionButton>
				<Margin bottom={PADDING_SIZE} />
				<ActionButton color={colors.lightBg} textColor={colors.secondaryBg} onPress={onClose} full={undefined}>{StandardStrings.t_cancel}</ActionButton>
				<Margin bottom={PADDING_SIZE} />
      </Container>
    </KyteModal>
  )
}

export default DeleteProductModal;
