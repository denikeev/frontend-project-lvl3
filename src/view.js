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
    <li>
      <a href=${post.link}>${post.titles}</a>
    </li>`, '');

  postsList.innerHTML = postsContent;
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
