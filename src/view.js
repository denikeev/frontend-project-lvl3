import { isEmpty } from 'lodash';

const renderFeeds = (elements, value) => {
  const { feeds, posts } = value;
  const { feeds: feedsContainer, posts: postsContainer } = elements;

  feedsContainer.innerHTML = '';
  postsContainer.innerHTML = '';

  const innerMarkup = '<h2 class="h4"></h2><ul></ul>';
  feedsContainer.innerHTML = innerMarkup;
  postsContainer.innerHTML = innerMarkup;
  const feedsList = document.querySelector('.feeds > ul');
  const postsList = document.querySelector('.posts > ul');
  const feedsTitle = document.querySelector('.feeds > h2');
  const postsTitle = document.querySelector('.posts > h2');
  feedsTitle.textContent = 'Фиды';
  postsTitle.textContent = 'Посты';

  const feedsContent = feeds.reduce((acc, feed) => `
    ${acc}
    <li>
      <h3 class="h5">${feed.title}</h3>
      <p class="small">${feed.description}</p>
    </li>`, '').trim();

  feedsList.innerHTML = feedsContent;

  const postsContent = posts.reduce((acc, post) => `
    ${acc}
    <li class="d-flex justify-content-between align-items-start py-1">
      <a href=${post.link}>${post.titles}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id="${post.id}">
      Просмотр
    </button>
    </li>`, '');
  postsList.innerHTML = postsContent;
  const buttons = document.querySelectorAll('button[data-bs-toggle="modal"]');
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = Number(e.target.dataset.id);
      const data = posts.filter(({ id }) => id === postId);
    });
  });
};

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
  if (path === 'feedsData') {
    renderFeeds(elements, value, prevValue);
  }
  if (path === 'processState') {
    if (value === 'sending') {
      elements.submit.disabled = true;
    }
    if (value === 'filling') {
      elements.submit.disabled = false;
    }
  }
};
