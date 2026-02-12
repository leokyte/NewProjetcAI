import { View } from "react-native"
import { colors } from "../../../styles"
import React from "react"

type BadgeProps = {
    status: 'success' | 'warning' | 'error' | 'info'
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
    const determineBackgroundColor = (status: BadgeProps['status']) => {
        switch (status) {
            case 'success':
                return colors.green01
            case 'warning':
                return colors.warningColor
            case 'error':
                return colors.errorColor
            case 'info':
                return colors.terciaryColor
        }
    }

    return (
        <View style={{
            backgroundColor: determineBackgroundColor(status),
            borderRadius: 3,
            padding: 3,
            width: 6,
            height: 6,
            marginRight: 6,
        }} />
    )
}