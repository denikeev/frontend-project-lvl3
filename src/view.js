export default (elements) => (path, value) => {
  if (path === 'error') {
    value.then((e) => console.log(e));
    elements.url.classList.add('is-invalid');
    value.then((data) => {
      const feedback = document.createElement('p');
      const feedbackContent = `<p class="feedback m-0 position-absolute small text-danger">${data.message}</p>`;
      feedback.innerHTML = feedbackContent;
      elements.form.append(feedback);
    });
  }
};
