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

const checkUpdates = (state, period = 5000) => {
  // let data = { feeds: [...state.feedsData.feeds], posts: [] };
  let data = state.feedsData;
  const promises = state.links.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => {
      const { contents } = response.data;
      const document = parser(contents);
      data = genFeeds(document, data);
    }));
  Promise.all(promises).then(() => {
    console.log('dataGenereated>>>', data);
    state.feedsData = data;
    setTimeout(() => checkUpdates(state), period);
  });
};

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
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const state = onChange(
    {
      valid: true,
      processState: 'filling',
      checking: false,
      url: '',
      errors: {},
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

    validate(state.url, state.links)
      .then((data) => {
        state.valid = isEmpty(data);
        state.errors = data;
      })
      .then(() => {
        if (state.valid) {
          state.processState = 'sending';
          state.links.push(state.url);
          axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.url)}`)
            .then((response) => {
              const { contents } = response.data;
              const document = parser(contents);
              if (isValidDocument(document)) {
                state.feedsData = genFeeds(document, state.feedsData);
                if (!state.checking) {
                  setTimeout(() => checkUpdates(state), 5000);
                  state.checking = true;
                }
              } else {
                state.errors = i18nInstance.t('errors.parsing.err');
              }
              state.processState = 'filling';
            })
            .catch((error) => {
              if (error.response) {
                state.errors = i18nInstance.t('errors.network.err');
              }
              state.processState = 'filling';
            });
        }
        return null;
      });
  });
};
