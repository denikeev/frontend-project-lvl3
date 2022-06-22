export default (elements) => (path, value) => {
  if (path === 'error') {
    elements.url.classList.add('is-invalid');
    const { message } = value;
    const feedback = document.createElement('p');
    const feedbackContent = `<p class="feedback m-0 position-absolute small text-danger">${message}</p>`;
    feedback.innerHTML = feedbackContent;
    elements.form.append(feedback);
  }
  if (path === 'processState') {
    elements.form.reset();
  }
};
