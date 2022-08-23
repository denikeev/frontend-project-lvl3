import { isEmpty } from 'lodash';

const renderFeeds = (feeds, feedsContainer, i18nInstance) => {
  feedsContainer.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  const feedsList = document.createElement('ul');

  feedsTitle.classList.add('h4', 'text-decoration-underline');
  feedsTitle.textContent = i18nInstance.t('feeds.name');
  feedsList.classList.add('list-group', 'border-0');
  feeds.forEach((item) => {
    const feed = document.createElement('li');
    const feedTitle = document.createElement('h3');
    const feedDescription = document.createElement('p');

    feed.classList.add('list-group-item', 'p-0', 'mt-2', 'border-0');
    feedTitle.classList.add('h5', 'mb-1');
    feedDescription.classList.add('small', 'mb-0');
    feedTitle.textContent = item.title;
    feedDescription.textContent = item.description;
    feed.append(feedTitle, feedDescription);
    feedsList.append(feed);
  });
  feedsContainer.append(feedsTitle, feedsList);
};

const renderPosts = (posts, postsContainer, readedPosts, i18nInstance) => {
  const isReadedPost = (post) => readedPosts.includes(post.id);
  postsContainer.innerHTML = '';
  const postsTitle = document.createElement('h2');
  const postsList = document.createElement('ul');

  postsTitle.classList.add('h4', 'text-decoration-underline');
  postsTitle.textContent = i18nInstance.t('posts.name');
  postsList.classList.add('list-group', 'border-0');
  posts.forEach((item) => {
    const post = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');

    post.classList.add('d-flex', 'list-group-item', 'justify-content-between', 'align-items-start', 'border-0', 'p-0', 'mt-2');
    link.classList.add(`${isReadedPost(item) ? 'fw-normal' : 'fw-bold'}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('href', item.link);
    link.setAttribute('data-id', item.id);
    link.textContent = item.title;
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('posts.buttonText');

    post.append(link, button);
    postsList.append(post);
  });
  postsContainer.append(postsTitle, postsList);
};

const renderContent = (elements, state, i18nInstance) => {
  const { feeds, posts } = state.feedsData;
  const { feeds: feedsContainer, posts: postsContainer } = elements;
  renderFeeds(feeds, feedsContainer, i18nInstance);
  renderPosts(posts, postsContainer, state.uiState.readedPosts, i18nInstance);
};

const errorKey = {
  parsingFailed: 'errors.parsing.err',
  networkError: 'errors.network.err',
  networkAborted: 'errors.network.aborted',
  notOneOf: 'errors.validation.notOneOf',
  required: 'errors.validation.required',
  url: 'errors.validation.url',
  unknownError: 'errors.unknown',
};

const renderErrors = (elements, value, prevValue, i18nInstance) => {
  const { feedback } = elements;
  const fieldHadError = !isEmpty(prevValue);
  const fieldHasError = !isEmpty(value);
  const errorText = errorKey[value];

  if (!fieldHasError && (!fieldHadError || fieldHadError)) {
    elements.url.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18nInstance.t('status.success');
    elements.form.reset();
    elements.url.focus();
    return;
  }
  if (fieldHadError && fieldHasError) {
    feedback.textContent = i18nInstance.t(errorText);
    return;
  }

  elements.url.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18nInstance.t(errorText);
};

const renderModalContent = (state, modalEl) => {
  const [openedPostId] = state.uiState.readedPosts;
  const post = state.feedsData.posts.find(({ id }) => id === openedPostId);
  const { title, description, link } = post;
  const linkEl = document.querySelector(`a[href="${link}"]`);
  const titleEl = modalEl.querySelector('.modal-title');
  const descriptionEl = modalEl.querySelector('.modal-body');
  const linkButtonEl = modalEl.querySelector('.full-article');
  linkEl.classList.remove('fw-bold');
  linkEl.classList.add('fw-normal');
  titleEl.textContent = title;
  descriptionEl.textContent = description;
  linkButtonEl.setAttribute('href', link);
};

export default (state, elements, i18nInstance, path, value, prevValue) => {
  switch (path) {
    case 'error': {
      renderErrors(elements, value, prevValue, i18nInstance);
      break;
    }
    case 'feedsData': case 'feedsData.posts':
      renderContent(elements, state, i18nInstance);
      break;
    case 'processState':
      if (value === 'sending') {
        elements.submit.disabled = true;
        elements.url.setAttribute('readonly', 'true');
      }
      if (value === 'filling') {
        elements.submit.disabled = false;
        elements.url.removeAttribute('readonly');
      }
      break;
    case 'uiState.modal':
      if (value === 'opened') {
        renderModalContent(state, elements.modal);
      }
      break;
    case 'uiState.readedPosts': {
      const [lastReadedId] = state.uiState.readedPosts;
      const post = state.feedsData.posts.find(({ id }) => id === lastReadedId);
      const { link } = post;
      const linkEl = document.querySelector(`a[href="${link}"]`);
      linkEl.classList.remove('fw-bold');
      linkEl.classList.add('fw-normal');
      break;
    }
    default:
      break;
  }
  return null;
};
