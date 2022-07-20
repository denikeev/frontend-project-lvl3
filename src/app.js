import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
import axios from 'axios';
import view from './view.js';
import resources from './locales/ru.js';
import parser, { isValidDocument } from './parser.js';
import genContent from './genContent.js';

const setListeners = (state) => {
  const buttons = document.querySelectorAll('button[data-bs-toggle="modal"]');
  const links = document.querySelectorAll('a[data-id]');
  const closeButtons = document.querySelectorAll('button[data-bs-dismiss="modal"]');
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = Number(e.target.dataset.id);
      state.uiState.readedPosts.unshift(postId);
      state.uiState.modal = 'opened';
    });
  });
  closeButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.uiState.modal = 'closed';
    });
  });
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const postId = Number(e.target.dataset.id);
      state.uiState.readedPosts.unshift(postId);
    });
  });
};

const checkUpdates = (state, period = 5000) => {
  let data = state.feedsData;
  const promises = state.links.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => {
      const { contents } = response.data;
      const document = parser(contents);
      data = genContent(document, data);
    }));

  Promise.all(promises).then(() => {
    state.feedsData = data;
    setListeners(state);
    setTimeout(() => checkUpdates(state), period);
  });
};

export default () => {
  const i18nInstance = i18n.createInstance();
  const defaultLanguage = 'ru';
  i18nInstance.init({
    lng: defaultLanguage,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
      required: () => ({ key: 'errors.validation.required' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.url' }),
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
      errors: {},
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
                state.feedsData = genContent(document, state.feedsData);
                setListeners(state);
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

  setTimeout(() => checkUpdates(state), 5000);
};
