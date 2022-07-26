import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import view from './view.js';
import resources from './locales/ru.js';
import { addFeed, checkNewPosts } from './handlers.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  const defaultLanguage = 'ru';
  i18nInstance.init({
    lng: defaultLanguage,
    resources,
    debug: false,
  });

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
      required: () => ({ key: 'required' }),
    },
    string: {
      url: () => ({ key: 'url' }),
    },
  });

  const baseSchema = yup.string().url().required();

  const elements = {
    form: document.getElementById('rss-form'),
    url: document.getElementById('url-input'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
  };

  const state = onChange(
    {
      valid: true,
      processState: 'filling',
      url: '',
      error: null,
      links: [],
      feedsData: {
        feeds: [],
        posts: [],
      },
      uiState: {
        readedPosts: [],
        modal: 'closed',
      },
    },
    (path, value, prevValue) => view(state, elements, i18nInstance, path, value, prevValue),
  );

  const validate = (currentUrl, urls) => {
    const schema = baseSchema.notOneOf(urls);
    return schema
      .validate(currentUrl)
      .then(() => {})
      .catch((e) => i18nInstance.t(e.message.key));
  };

  elements.form.addEventListener('submit', (e) => addFeed(e, state, validate, i18nInstance));

  setTimeout(() => checkNewPosts(state), 5000);
};
