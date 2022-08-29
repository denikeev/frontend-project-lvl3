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

const renderPosts = (posts, postsContainer, viewedPostsIds, i18nInstance) => {
  const isReadedPost = (post) => viewedPostsIds.has(post.id);
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
    link.classList.add(isReadedPost(item) ? 'fw-normal' : 'fw-bold');
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
  renderPosts(posts, postsContainer, state.uiState.viewedPostsIds, i18nInstance);
};

const errorKeys = {
  parsingFailed: 'errors.parsing.err',
  networkError: 'errors.network.err',
  networkAborted: 'errors.network.aborted',
  notOneOf: 'errors.validation.notOneOf',
  required: 'errors.validation.required',
  url: 'errors.validation.url',
  unknownError: 'errors.unknown',
};

const renderUrlState = (elements, value, i18nInstance, errorName = null) => {
  const {
    feedback,
    submit,
    url,
    form,
  } = elements;

  const text = errorKeys[errorName];
  switch (value) {
    case 'error':
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      url.classList.add('is-invalid');
      feedback.textContent = i18nInstance.t(text);
      break;
    case 'filling':
      submit.disabled = false;
      url.removeAttribute('readonly');
      url.classList.remove('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18nInstance.t(text);
      break;
    case 'sending':
      submit.disabled = true;
      url.setAttribute('readonly', 'true');
      url.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18nInstance.t('status.loading');
      break;
    case 'loaded':
      feedback.textContent = i18nInstance.t('status.success');
      submit.disabled = false;
      url.removeAttribute('readonly');
      form.reset();
      url.focus();
      break;
    default: throw new Error(`Unknown state: '${value}'!`);
  }
};

const renderModalContent = (state, modalEl) => {
  const [viewableId] = Array.from(state.uiState.viewedPostsIds).slice(-1);
  const post = state.feedsData.posts.find(({ id }) => id === viewableId);
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

export default (state, elements, i18nInstance, path, value) => {
  switch (path) {
    case 'error': {
      renderUrlState(elements, path, i18nInstance, value);
      break;
    }
    case 'feedsData': case 'feedsData.posts':
      renderContent(elements, state, i18nInstance);
      break;
    case 'processState':
      renderUrlState(elements, value, i18nInstance, state.error);
      break;
    case 'uiState.openedModalId':
      renderModalContent(state, elements.modal);
      break;
    case 'uiState.viewedPostsIds': {
      const [viewedId] = Array.from(state.uiState.viewedPostsIds).slice(-1);
      const post = state.feedsData.posts.find(({ id }) => id === viewedId);
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
