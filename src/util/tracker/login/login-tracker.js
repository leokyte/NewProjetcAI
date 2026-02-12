// STEP NAMES
export const APP_MAIN_SCREEN = 'app-main-screen';

export const APP_EMAIL_SCREEN = 'app-email-screen';
export const EMAIL_BUTTON_ACTION = 'email-button-action';
export const EMAIL_ACCOUNT_VERIFY_EXISTS = 'email-account-verify-exists';
export const EMAIL_ACCOUNT_VERIFY_NEW = 'email-account-verify-new';
export const EMAIL_ACCOUNT_VERIFY_ERROR = 'email-account-verify-error';
export const EMAIL_ACCOUNT_CREATION_SCREEN = 'email-account-creation-screen';
export const EMAIL_ACCOUNT_CREATION_BUTTON_ACTION = 'email-account-creation-button-action';
export const EMAIL_ACCOUNT_CREATION_SUCCESS = 'email-account-creation-success';
export const EMAIL_ACCOUNT_CREATION_ERROR = 'email-account-creation-error';
export const EMAIL_ALREADY_HAD_ACCOUNT_BUTTON_ACTION = 'email-already-had-account-button-action';

export const FACEBOOK_BUTTON_ACTION = 'facebook-button-action';
export const FACEBOOK_ACCOUNT_CREATION_SUCCESS = 'facebook-account-creation-success';
export const FACEBOOK_ACCOUNT_LOGIN_SUCCESS = 'facebook-account-login-success';
export const FACEBOOK_ACCOUNT_ERROR = 'facebook-account-error';

export const GOOGLE_BUTTON_ACTION = 'google-button-action';
export const GOOGLE_ACCOUNT_CREATION_SUCCESS = 'google-account-creation-success';
export const GOOGLE_ACCOUNT_LOGIN_SUCCESS = 'google-account-login-success';
export const GOOGLE_ACCOUNT_ERROR = 'google-account-error';

export const APPLE_BUTTON_ACTION = 'apple-button-action';
export const APPLE_ACCOUNT_CREATION_SUCCESS = 'apple-account-creation-success';
export const APPLE_ACCOUNT_LOGIN_SUCCESS = 'apple-account-login-success';
export const APPLE_ACCOUNT_ERROR = 'apple-account-error';

export const APP_PASSWORD_SCREEN = 'app-password-screen';
export const APP_PASSWORD_BUTTON_ACTION = 'app-password-button-action';
export const APP_PASSWORD_LOGIN_SUCCESS = 'app-password-login-success';
export const APP_PASSWORD_LOGIN_ERROR = 'app-password-login-error';
export const APP_PASSWORD_VISIBILITY_ACTION = 'app-password-visibility-action';

export const FORGOT_PASSWORD_BUTTON_ACTION = 'forgot-password-button-action';
export const FORGOT_PASSWORD_REQUEST_SUCCESS = 'forgot-password-request-success';
export const FORGOT_PASSWORD_REQUEST_ERROR = 'forgot-password-request-error';
export const FORGOT_PASSWORD_CODE_CONFIRMATION_SCREEN = 'forgot-password-code-confirmation-screen';
export const FORGOT_PASSWORD_CODE_CONFIRMATION_SUCCESS =
  'forgot-password-code-confirmation-success';
export const FORGOT_PASSWORD_CODE_CONFIRMATION_ERROR = 'forgot-password-code-confirmation-error';
export const FORGOT_PASSWORD_CHANGE_PASSWORD_SCREEN = 'forgot-password-change-password-screen';
export const FORGOT_PASSWORD_CHANGE_PASSWORD_SUCCESS = 'forgot-password-change-password-success';
export const FORGOT_PASSWORD_CHANGE_PASSWORD_ERROR = 'forgot-password-change-password-error';

export const APP_TERMS_ACCEPTION_SCREEN = 'app-terms-acception-screen';
export const TERMS_ACCEPTION_BUTTON_ACTION = 'terms-acception-button-action';
export const TERMS_ACCEPTION_SUCCESS = 'terms-acception-success';
export const TERMS_ACCEPTION_ERROR = 'terms-acception-error';

export const APP_SALE_SCREEN = 'app-sale-screen';

export const LOGIN_TRACKER_SESSION_ID = 'login-tracker-session_id';

export const LoginTracker = {
  trackSuccessEvent: (step_name, payload) => {
    // AsyncStorage.getItem(LOGIN_TRACKER_SESSION_ID).then((session_id) => {});
  },
  trackErrorEvent: (step_name, payload) => {
    // AsyncStorage.getItem(LOGIN_TRACKER_SESSION_ID).then((session_id) => {});
  },
};
