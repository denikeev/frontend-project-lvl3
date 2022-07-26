import { isEmpty } from 'lodash';

const renderFeeds = (feeds, feedsContainer, i18nInstance) => {
  feedsContainer.innerHTML = '';
  const innerMarkup = '<h2 class="h4 text-decoration-underline"></h2><ul class="list-group border-0"></ul>';
  feedsContainer.innerHTML = innerMarkup;
  const feedsList = document.querySelector('.feeds > ul');
  const feedsTitle = document.querySelector('.feeds > h2');
  feedsTitle.textContent = i18nInstance.t('feeds.name');
  const feedsHtml = feeds.map(() => "<li class='list-group-item p-0 mt-2 border-0'><h3 class='h5 mb-1'></h3><p class='small mb-0'></p></li>", '').join('').trim();
  feedsList.innerHTML = feedsHtml;
  const feedsItems = feedsList.querySelectorAll('.list-group-item');

  feedsItems.forEach((item, index) => {
    const title = item.querySelector('h3');
    const description = item.querySelector('p');
    title.textContent = feeds[index].title;
    description.textContent = feeds[index].description;
  });
};

const renderPosts = (posts, postsContainer, state, i18nInstance) => {
  postsContainer.innerHTML = '';
  const innerMarkup = '<h2 class="h4 text-decoration-underline"></h2><ul class="list-group border-0"></ul>';
  postsContainer.innerHTML = innerMarkup;
  const postsList = document.querySelector('.posts > ul');
  const postsTitle = document.querySelector('.posts > h2');
  postsTitle.textContent = i18nInstance.t('posts.name');
  const postsHtml = posts.map(() => "<li class='d-flex list-group-item justify-content-between align-items-start border-0 p-0 mt-2'><a class='' data-id='' target='_blank'></a><button type='button' class='btn btn-outline-primary btn-sm' data-bs-toggle='modal' data-bs-target='#modal' data-id=''></button></li>").join('').trim('');
  postsList.innerHTML = postsHtml;
  const postsItems = postsList.querySelectorAll('.list-group-item');

  postsItems.forEach((item, index) => {
    const isReaded = () => state.uiState.readedPosts.includes(posts[index].id);
    const url = item.querySelector('a');
    url.setAttribute('href', posts[index].link);
    url.setAttribute('data-id', posts[index].id);
    url.classList.add(`${isReaded() ? 'fw-normal' : 'fw-bold'}`);
    url.textContent = posts[index].title;
    const button = item.querySelector('button');
    button.setAttribute('data-id', posts[index].id);
    button.textContent = i18nInstance.t('posts.buttonText');
  });
};

const renderContent = (elements, state, i18nInstance) => {
  const { feeds, posts } = state.feedsData;
  const { feeds: feedsContainer, posts: postsContainer } = elements;
  renderFeeds(feeds, feedsContainer, i18nInstance);
  renderPosts(posts, postsContainer, state, i18nInstance);
};

const errorKey = {
  parsingFailed: 'errors.parsing.err',
  networkError: 'errors.network.err',
  networkAborted: 'errors.network.aborted',
  notOneOf: 'errors.validation.notOneOf',
  required: 'errors.validation.required',
  url: 'errors.validation.url',
};

const renderErrors = (elements, value, prevValue, i18nInstance) => {
  const { feedback } = elements;
  const fieldHadError = !isEmpty(prevValue);
  const fieldHasError = !isEmpty(value);
  const errorText = errorKey[value];
  if (!fieldHadError && !fieldHasError) {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18nInstance.t('status.success');
    elements.form.reset();
    elements.url.focus();
    return;
  }
  if (fieldHadError && !fieldHasError) {
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

const renderModal = (value, state) => {
  const [openedPostId] = state.uiState.readedPosts;
  const [post] = state.feedsData.posts.filter(({ id }) => id === openedPostId);
  const { title, description, link } = post;
  const linkEl = document.querySelector(`a[href="${link}"]`);
  const modalEl = document.getElementById('modal');
  const bodyEl = document.body;
  if (value === 'opened') {
    bodyEl.classList.add('modal-open');
    bodyEl.setAttribute('style', 'overflow: hidden; padding-right: 17px;');
    const modalBackdrop = document.createElement('div');
    modalBackdrop.classList.add('modal-backdrop', 'fade', 'show');
    bodyEl.append(modalBackdrop);
    const titleEl = modalEl.querySelector('.modal-title');
    const descriptionEl = modalEl.querySelector('.modal-body');
    const linkButtonEl = modalEl.querySelector('.full-article');
    linkEl.classList.remove('fw-bold');
    linkEl.classList.add('fw-normal');
    modalEl.removeAttribute('aria-hidden');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('style', 'display: block');
    modalEl.classList.add('show');
    titleEl.textContent = title;
    descriptionEl.textContent = description;
    linkButtonEl.setAttribute('href', link);
  }
  if (value === 'closed') {
    const modalBackdrop = bodyEl.querySelector('.modal-backdrop');
    modalBackdrop.remove();
    bodyEl.classList.remove('modal-open');
    bodyEl.removeAttribute('style');
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.removeAttribute('aria-modal');
    modalEl.removeAttribute('role');
    modalEl.setAttribute('style', 'display: none');
    modalEl.classList.remove('show');
  }
};

export default (state, elements, i18nInstance, path, value, prevValue) => {
  switch (path) {
    case 'error': {
      renderErrors(elements, value, prevValue, i18nInstance);
      break;
    }
    case 'feedsData':
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
      renderModal(value, state);
      break;
    case 'uiState.readedPosts': {
      const [lastReadedId] = state.uiState.readedPosts;
      const [post] = state.feedsData.posts.filter(({ id }) => id === lastReadedId);
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
