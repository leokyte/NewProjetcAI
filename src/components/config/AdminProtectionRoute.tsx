import React, { useEffect } from "react"
import { checkUserPermission } from "../../util"
import { connect } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { IPermissions } from "@kyteapp/kyte-utils"
import { InjectedFormProps } from "redux-form"
import Container from "@kyteapp/kyte-ui-components/src/packages/scaffolding/container/Container"

interface AdminProtectionProps {
  userPermissions: IPermissions;
  children: React.ReactNode;
  initialRouteName: string
}

type Props = AdminProtectionProps & InjectedFormProps<AdminProtectionProps>

const AdminProtection: React.FC<Props> = ({ children, userPermissions, initialRouteName }) => {
  const { isAdmin } = checkUserPermission(userPermissions)
  const navigation = useNavigation();


  useEffect(() => {
    if(!isAdmin) navigation.reset({
			index: 0,
			routes: [{ name: initialRouteName }],
		});
  }, [isAdmin])

  return (
    <Container flex={1}>
        {isAdmin ? children : null}
    </Container>
)
}

const mapStateToProps = (state: any) => ({
  userPermissions: state.auth.user.permissions,
})

export default connect(mapStateToProps, null)(AdminProtection as any)
