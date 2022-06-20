import onChange from 'on-change';
import {
  string,
  url, // eslint-disable-line
  required, // eslint-disable-line
  notOneOf, // eslint-disable-line
} from 'yup'; // сделать нужные
import { isEmpty } from 'lodash';
import view from './view.js';

export default () => {
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
    view(elements),
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
