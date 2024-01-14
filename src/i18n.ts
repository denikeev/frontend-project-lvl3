import * as i18next from 'i18next';
import resources from './locales/ru.js';

const defaultLanguage = 'ru';
const i18nInstance = i18next.createInstance();

i18nInstance.init({
  lng: defaultLanguage,
  debug: false,
  resources,
});

export default i18nInstance;