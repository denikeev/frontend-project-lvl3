import onChange from 'on-change';
import * as yup from 'yup'; // сделать нужные
import view from './view.js';

const schema = yup.object().shape({ // может shape можно убрать
  url: yup.string().url().required(), // попробовать имя url изменить
});

const validate = (obj) => schema.validate(obj)
  .then(() => {})
  .catch((e) => {
    console.dir(e);
    return e;
  });

// const validate = (field) => {
//   try {
//     schema.validate(field, { abortEarly: false }); // аборт попробовать отключить
//     return {};
//   } catch (e) {
//     console.log(e);
//     return '';
//   }
// };

export default () => {
  const elements = {
    form: document.getElementById('rss-form'),
    url: document.getElementById('url-input'),
    submit: document.querySelector('button[type="submit"]'),
  };

  const state = onChange({
    valid: true,
    url: '',
    error: {},
  }, view(elements));

  elements.url.addEventListener('input', (e) => {
    const { value } = e.target;
    state.url = value;
    const message = validate(state).then((d) => d.message);
    state.error = {
      url: message,
    };
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
};
