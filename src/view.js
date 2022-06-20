import { has } from 'lodash';

const renderErrors = (elements, value, prevValue) => {
  const fieldHadError = has(prevValue, 'message');
  const fieldHasError = has(value, 'message');

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
  if (fieldHadError && fieldHasError) {
    const { message } = value;
    const feedback = document.querySelector('.feedback');
    feedback.textContent = message;
    return;
  }

  elements.url.classList.add('is-invalid');
  const { message } = value;
  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'small', 'text-danger');
  feedback.textContent = message;
  elements.form.append(feedback);
};

export default (elements) => (path, value, prevValue) => {
  if (path === 'errors') {
    renderErrors(elements, value, prevValue);
  }
};
