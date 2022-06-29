import { has } from 'lodash';

const renderErrors = (elements, value, prevValue, i18nInstance) => {
  const fieldHadError = has(prevValue, 'message');
  const fieldHasError = has(value, 'message');
  console.dir(value);
  if (!fieldHadError && !fieldHasError) {
    return;
  }
  if (fieldHadError && !fieldHasError) {
    elements.url.classList.remove('is-invalid');
    const feedback = document.querySelector('.feedback');
    feedback.remove();
    elements.form.reset();
    elements.url.focus();
    return;
  }
  const errorType = value.type;
  if (fieldHadError && fieldHasError) {
    const feedback = document.querySelector('.feedback');
    feedback.textContent = i18nInstance.t(`errors.${errorType}`);
    return;
  }

  elements.url.classList.add('is-invalid');
  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'small', 'text-danger');
  feedback.textContent = i18nInstance.t(`errors.${errorType}`);
  elements.form.append(feedback);
};

export default (elements, i18nInstance) => (path, value, prevValue) => {
  if (path === 'errors') {
    renderErrors(elements, value, prevValue, i18nInstance);
  }
};
