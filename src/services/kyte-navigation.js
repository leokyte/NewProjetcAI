import { CommonActions, StackActions, DrawerActions } from '@react-navigation/native';

let _navigator;

const setTopLevelNavigator = (navigatorRef) => {
  _navigator = navigatorRef;
};

const getActiveRouteName = () => {
  return _navigator.getCurrentRoute().name;
};

const navigate = (stackName, name, params) => {
  _navigator.dispatch(
    stackName
      ? CommonActions.navigate(stackName, { screen: name, params })
      : CommonActions.navigate(name, params),
  );
};

const reset = (name, resetName, params) => {
  _navigator.dispatch((state) => {
    const hasResetRoute = state.routes.find((r) => r.name === resetName);

    return hasResetRoute
      ? StackActions.replace(name, params)
      : CommonActions.navigate(name, params);
  });
};

const replace = (name, params) => {
  _navigator.dispatch((state) => {
    return {
      ...StackActions.replace(name, params),
      source: `${name}Page`,
      target: state.key,
    };
  });
};

const resetWithNavigate = (routesToNavigate) => {
  const navigateActions = routesToNavigate.map((r) => {
    let options = { name: r.name };
    if (r.params) options = { ...options, params: r.params };
    return CommonActions.navigate(options);
  });

  const resetAction = CommonActions.reset({
    index: navigateActions.length - 1,
    actions: navigateActions,
  });
  _navigator.dispatch(resetAction);
};

const resetNavigation = (route, params) => {
  _navigator.dispatch(() => {
    return CommonActions.reset({
      index: 0,
      routes: [{ name: route, params }],
    });
  });
};

const pop = (props) => _navigator.dispatch(StackActions.pop(props));

const closeDrawer = () => _navigator.dispatch(DrawerActions.closeDrawer());
const openDrawer = () => _navigator.dispatch(DrawerActions.openDrawer());
const NavigationService = {
  navigate,
  reset,
  replace,
  pop,
  setTopLevelNavigator,
  resetWithNavigate,
  closeDrawer,
  openDrawer,
  getActiveRouteName,
  resetNavigation,
};

export default NavigationService;
