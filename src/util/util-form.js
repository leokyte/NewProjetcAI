import I18n from '../i18n/i18n';

export const emailValidate = (values) => {
  const errors = {};
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i;

  if (!values.email) {
    errors.email = I18n.t('receiptShareFieldValidate.empty');
  }

  if (values.email && !emailRegex.test(values.email)) {
    errors.email = I18n.t('receiptShareFieldValidate.invalid');
  }
  return errors;
};
