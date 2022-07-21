import { isEmpty } from 'lodash';
import axios from 'axios';
import parser, { isValidDocument } from './parser.js';
import genFeedList from './genFeedList.js';

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

const checkNewPosts = (state, period = 5000) => {
  let data = state.feedsData;
  const promises = state.links.map((link) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => {
      const { contents } = response.data;
      const document = parser(contents);
      data = genFeedList(document, data);
    }));

  Promise.all(promises).then(() => {
    state.feedsData = data;
    setListeners(state);
    setTimeout(() => checkNewPosts(state), period);
  });
};

const processLink = (e, state, validate, i18nInstance) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  state.url = formData.get('url');

  validate(state.url, state.links)
    .then((data) => {
      state.valid = isEmpty(data);
      if (state.valid) {
        state.processState = 'sending';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(state.url)}`, { timeout: 10000 });
      }
      state.errors = data;
      return null;
    })
    .then((response) => {
      const { contents } = response.data;
      const document = parser(contents);
      if (isValidDocument(document)) {
        state.feedsData = genFeedList(document, state.feedsData);
        state.errors = {};
        state.links.push(state.url);
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
      if (error.code === 'ECONNABORTED') {
        state.errors = i18nInstance.t('errors.network.aborted');
      }
      state.processState = 'filling';
    });
};

export { processLink, checkNewPosts };