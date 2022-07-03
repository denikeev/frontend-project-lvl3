import i18n from 'i18next';
import onChange from 'on-change';
import {
  string,
  url, // eslint-disable-line
  required, // eslint-disable-line
  notOneOf, // eslint-disable-line
  setLocale, // eslint-disable-line
} from 'yup';
import { isEmpty } from 'lodash';
import axios from 'axios';
import view from './view.js';
import resources from './locales/ru.js';
import parser, { isValidDocument } from './parser.js';
import genFeeds from './genFeeds.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources,
  });

  setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.url' }),
    },
  });

  const baseSchema = string().url().required();

  const elements = {
    form: document.getElementById('rss-form'),
    url: document.getElementById('url-input'),
    submit: document.querySelector('button[type="submit"]'),
  };

  const state = onChange(
    {
      valid: true,
      url: '',
      errors: {
        validation: {},
        network: false,
        parsing: false,
      },
      links: [],
      feedsData: {
        feeds: [],
        posts: [],
      },
    },
    view(elements, i18nInstance),
  );

  const validate = (currentUrl, urls) => {
    const schema = baseSchema.notOneOf(urls);
    return schema
      .validate(currentUrl)
      .then(() => {})
      .catch((e) => i18nInstance.t(e.message.key));
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.url = formData.get('url');

    validate(state.url, state.links).then((data) => {
      state.valid = isEmpty(data);
      state.errors.validation = data;
      if (state.valid) {
        state.links.push(state.url);
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.url)}`)
          .then((response) => {
            const { contents } = response.data;
            const document = parser(contents);
            if (isValidDocument(document)) {
              state.feedsData = genFeeds(document, state.feedsData);
            } else {
              state.errors.parsing = i18nInstance.t('errors.parsing.err');
            }
          })
          .catch((error) => {
            if (error.response) {
              state.errors.network = i18nInstance.t('errors.network.err');
            }
          });
      }
    });
  });
};