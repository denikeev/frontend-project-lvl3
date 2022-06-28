import { isEmpty } from 'lodash';

const renderErrors = (elements, value, prevValue) => {
  const fieldHadError = !isEmpty(prevValue);
  const fieldHasError = !isEmpty(value);
  if (!fieldHadError && !fieldHasError) {
    elements.form.reset();
    elements.url.focus();
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
    const feedback = document.querySelector('.feedback');
    feedback.textContent = value;
    return;
  }

  elements.url.classList.add('is-invalid');
  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'm-0', 'small', 'text-danger');
  feedback.textContent = value;
  elements.form.append(feedback);
};

export default (elements) => (path, value, prevValue) => {
  if (path === 'errors') {
    renderErrors(elements, value, prevValue);
  }
};
