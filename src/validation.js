import onChange from 'on-change';
import * as yup from 'yup'; // сделать нужные
import { isEmpty } from 'lodash';
import view from './view.js';

export default () => {
  const elements = {
    form: document.getElementById('rss-form'),
    url: document.getElementById('url-input'),
    submit: document.querySelector('button[type="submit"]'),
  };

  const state = onChange({
    valid: true,
    processState: 'filling',
    url: '',
    error: {},
    links: [],
  }, view(elements));

  const schema = yup.object().shape({ // может shape можно убрать
    url: yup.string().url().required().notOneOf(state.links), // попробовать имя url изменить
  });

  const validate = (obj) => schema.validate(obj)
    .then(() => {})
    .catch((e) => e);

  // elements.url.addEventListener('input', (e) => {
  //   const { value } = e.target;
  //   state.url = value;
  //   const error = validate(state);
  //   state.error = { url: error };
  //   // state.valid = isEmpty(error);
  // });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    state.url = formData.get('url');
    console.log('beforeValidate>>>', state.links);
    validate(state).then((data) => {
      state.valid = isEmpty(data);
      console.log(data);
      if (!state.valid) {
        state.error = data;
        console.log('error>>>', state.links);
      }
      if (state.valid) {
        state.processState = 'sending';
        state.links.push(state.url);
        console.log('notError>>>', state.links);
      }
    });
  });
};
