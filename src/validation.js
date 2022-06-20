import * as yup from 'yup'; // сделать нужные
import view from './view.js';

const schema = yup.object().shape({
  url: yup.string().url().required(), // попробовать имя url изменить
});

export default () => {

};
