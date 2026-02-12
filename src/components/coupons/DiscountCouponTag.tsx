import React from 'react';
import { Container, KyteText} from "@kyteapp/kyte-ui-components"
import { KyteIcon } from '../common';

interface DiscountCouponTagProps {
  isLoading?: boolean
  title?: string
  value?: string
  titleSize?: string
  color?: string
}

export const DiscountCouponTag = ({ title }: DiscountCouponTagProps) => (
  <Container style={styles.badge}>
    <KyteIcon color="rgba(21, 24, 30, 0.48)" name="coupon-icon" size={16} style={styles.badgeIcon} />
    <KyteText weight={500} size={11} style={styles.badgeText}>
      {title}
    </KyteText>
  </Container>
)

const styles = {
  badge: {
    width: 'auto',
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1000,
    backgroundColor: "rgba(21, 24, 30, 0.04)",
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    color: "rgba(21, 24, 30, 0.48))",
    textTransform: 'uppercase'

  },
}
