import { logScreenView } from './Firebase-Integration';

export const AnswersScreen = async (screen, category, properties) => {
  await logScreenView({
    screen_name: screen,
    screen_class: screen,
  });
};

export const AnswersEvent = (name, properties) => {
  // firebase.analytics().logEvent(name, properties);
};

export const AnswersEventLogin = (provider) => {
  // Answers.logLogin(provider, true);
};
