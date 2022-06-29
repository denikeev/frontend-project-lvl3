import i18n from 'i18next';
import onChange from 'on-change';
import {
  string,
  url, // eslint-disable-line
  required, // eslint-disable-line
  notOneOf, // eslint-disable-line
} from 'yup';
import { isEmpty } from 'lodash';
import view from './view.js';
import resources from './locales/ru.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources,
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
      errors: {},
      links: [],
    },
    view(elements, i18nInstance),
  );

  const validate = (currentUrl, urls) => {
    const schema = baseSchema.notOneOf(urls);
    return schema
      .validate(currentUrl)
      .then(() => {})
      .catch((e) => e);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.url = formData.get('url');

    validate(state.url, state.links).then((data) => {
      state.valid = isEmpty(data);
      state.errors = data;
      if (state.valid) {
        state.links.push(state.url);
      }
    });
  });
};
