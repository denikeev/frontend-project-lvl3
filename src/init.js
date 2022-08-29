import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import 'bootstrap';
import view from './view.js';
import resources from './locales/ru.js';
import parser from './parser.js';
import { addNewFeed, getNewPosts } from './normalizeData.js';

const postsCheckInterval = 5000;

const getAddedLinks = (feeds) => feeds.map((feed) => feed.link);

const genUrl = (address) => {
  const url = new URL('/get', 'https://allorigins.hexlet.app');
  url.searchParams.set('disableCache', true);
  url.searchParams.set('url', address);
  return url.toString();
};

const checkNewPosts = (state, period = postsCheckInterval) => {
  const addedLinks = getAddedLinks(state.feedsData.feeds);
  const promises = addedLinks.map((link) => axios.get(genUrl(link))
    .then((response) => {
      const { contents } = response.data;
      const parsedData = parser(contents);
      const newPosts = getNewPosts(parsedData.posts, state.feedsData.posts);
      state.feedsData.posts = [...newPosts, ...state.feedsData.posts];
    }));

  Promise.all(promises).finally(() => {
    setTimeout(() => checkNewPosts(state), period);
  });
};

const handleErrors = (error, state) => {
  if (error.name === 'ValidationError') {
    const { key } = error.message;
    state.error = key;
    return;
  }
  if (error.message === 'parsingFailed') {
    state.error = 'parsingFailed';
    state.processState = 'filling';
    return;
  }
  if (error.response) {
    state.error = 'networkError';
    state.processState = 'filling';
    return;
  }
  if (error.code === 'ECONNABORTED') {
    state.error = 'networkAborted';
    state.processState = 'filling';
    return;
  }
  state.error = 'unknownError';
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
    modal: document.getElementById('modal'),
  };

  const state = onChange(
    {
      processState: 'filling',
      url: '',
      error: null,
      feedsData: {
        feeds: [],
        posts: [],
      },
      uiState: {
        viewedPostsIds: new Set(),
        openedModalId: null,
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
    const addedLinks = getAddedLinks(state.feedsData.feeds);

    validate(state.url, addedLinks)
      .then(() => {
        state.processState = 'sending';
        return axios.get(genUrl(state.url), { timeout: 30000 });
      })
      .then(({ data }) => {
        const parsedData = parser(data.contents);
        const feeds = addNewFeed(parsedData, state.feedsData, state.url);
        state.feedsData = feeds;
        state.processState = 'loaded';
      })
      .catch((error) => handleErrors(error, state));
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      state.uiState.viewedPostsIds.add(postId);
    }
    if (e.target.hasAttribute('data-bs-toggle')) {
      e.preventDefault();
      state.uiState.openedModalId = postId;
    }
  });

  setTimeout(() => checkNewPosts(state), postsCheckInterval);
};
