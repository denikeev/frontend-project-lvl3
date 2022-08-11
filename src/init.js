import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
import axios from 'axios';

import view from './view.js';
import resources from './locales/ru.js';
import parser from './parser.js';
import normalizeData from './normalizeData.js';

const postsCheckInterval = 5000;

const setListeners = (state) => {
  const posts = document.querySelector('.posts');
  const closeButtons = document.querySelectorAll('button[data-bs-dismiss="modal"]');
  posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      state.uiState.readedPosts.unshift(postId);
    }
    if (e.target.hasAttribute('data-bs-toggle')) {
      e.preventDefault();
      state.uiState.modal = 'opened';
    }
  });
  closeButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.uiState.modal = 'closed';
    });
  });
};

const checkNewPosts = (state, period = postsCheckInterval) => {
  let data = state.feedsData;
  const promises = state.links.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => {
      const { contents } = response.data;
      const parsedDocument = parser(contents);
      data = normalizeData(parsedDocument, data);
    }));

  Promise.all(promises).then(() => {
    state.feedsData = data;
    setListeners(state);
    setTimeout(() => checkNewPosts(state), period);
  });
};

const handleErrors = (error, state) => {
  if (error.message === 'parsingFailed') {
    state.error = 'parsingFailed';
    state.processState = 'filling';
    return;
  }
  if (error.name === 'ValidationError') {
    const { key } = error.message;
    state.error = key;
    return;
  }
  if (error.response) {
    state.error = 'networkError';
    return;
  }
  if (error.code === 'ECONNABORTED') {
    state.error = 'networkAborted';
    return;
  }
  state.error = 'unknownError';
  state.processState = 'filling';
};

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
    return schema.validate(currentUrl);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.url = formData.get('url');

    validate(state.url, state.links)
      .then((data) => {
        state.valid = isEmpty(data);
        state.processState = 'sending';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.url)}`, { timeout: 10000 });
      })
      .then(({ data }) => {
        const parsedDocument = parser(data.contents);
        const errorNode = parsedDocument.querySelector('parsererror');
        if (errorNode) {
          throw new Error('parsingFailed');
        }
        state.feedsData = normalizeData(parsedDocument, state.feedsData);
        state.error = '';
        state.links.push(state.url);
        setListeners(state);
        state.processState = 'filling';
      })
      .catch((error) => handleErrors(error, state));
  });

  setTimeout(() => checkNewPosts(state), postsCheckInterval);
};

// почему-то при нажатии на просмотр, верстка дергается вправо-влево, посмотри пожалуйста
