import { createStackNavigator } from '@react-navigation/stack'
import VariationsManager from '../../components/products/variants/variations-manager/VariationsManager'
import React, { ComponentProps } from 'react'
import VariationCreatePage from '../../components/products/variants/variations-manager/create/VariationCreatePage'
import VariationEditPage from '../../components/products/variants/variations-manager/edit/VariationEditPage'
import { connect } from 'react-redux'
import { RootState } from '../../types/state/RootState'
import { checkHasVariantsPermission } from '../../util/products/util-variants'
import { KyteAlert } from '../../components/common'
import { useNavigation } from '@react-navigation/native'
import I18n from '../../i18n/i18n'

const Stack = createStackNavigator()
const screenOptions: ComponentProps<typeof Stack.Navigator>['screenOptions'] = { headerShown: false }
type Props = {} & ReturnType<typeof mapStateToProps>
const Strings = {
	permission_alert_title: I18n.t('words.s.attention'),
	permission_alert_subtitle: I18n.t('variants.missingPermission'),
	permission_alert_button: I18n.t('okUnderstood'),
}

const VariationsManagerStack: React.FC<Props> = ({ user }) => {
	const hasVariantsPermission = checkHasVariantsPermission(user.permissions)
	const navigation = useNavigation()

	return (
		<>
			{!hasVariantsPermission && (
				<KyteAlert
					hideModal={navigation.goBack}
					showTopCloseButton
					action={navigation.goBack}
					title={Strings.permission_alert_title}
					contentText={Strings.permission_alert_subtitle}
					actionButtonText={Strings.permission_alert_button}
				/>
			)}
			<Stack.Navigator screenOptions={screenOptions}>
				<Stack.Screen name="VariationsManager" component={VariationsManager} />
				<Stack.Screen name="VariationCreatePage" component={VariationCreatePage} />
				<Stack.Screen name="VariationEditPage" component={VariationEditPage} />
			</Stack.Navigator>
		</>
	)
}

function mapStateToProps(state: RootState) {
	const { user } = state.auth ?? {}

	return { user }
}

export default connect(mapStateToProps)(VariationsManagerStack)
