import { isEmpty } from 'lodash';

const renderFeeds = (elements, state, i18nInstance) => {
  const { feeds, posts } = state.feedsData;
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
  feedsTitle.textContent = i18nInstance.t('feeds.name');
  postsTitle.textContent = i18nInstance.t('posts.name');

  const feedsContent = feeds.reduce((acc, feed) => `
    ${acc}
    <li>
      <h3 class="h5">${feed.title}</h3>
      <p class="small">${feed.description}</p>
    </li>`, '').trim();

  feedsList.innerHTML = feedsContent;

  const postsContent = posts.reduce((acc, post) => {
    const isReaded = () => state.uiState.readedPosts.includes(post.id);
    return `${acc}<li class="d-flex justify-content-between align-items-start py-1"><a href=${post.link} class="${isReaded() ? 'fw-normal' : 'fw-bold'}" data-id="${post.id}" target="_blank">${post.title}</a><button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id="${post.id}">${i18nInstance.t('posts.buttonText')}</button></li>`;
  }, '');
  postsList.innerHTML = postsContent;
};

const renderErrors = (elements, value, prevValue, i18nInstance) => {
  const { feedback } = elements;
  const fieldHadError = !isEmpty(prevValue);
  const fieldHasError = !isEmpty(value);
  if (!fieldHadError && !fieldHasError) {
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
    feedback.textContent = value;
    return;
  }

  elements.url.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = value;
  elements.form.append(feedback);
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
  if (path === 'errors') {
    renderErrors(elements, value, prevValue, i18nInstance);
  }
  if (path === 'feedsData') {
    renderFeeds(elements, state, i18nInstance);
  }
  if (path === 'processState') {
    if (value === 'sending') {
      elements.submit.disabled = true;
    }
    if (value === 'filling') {
      elements.submit.disabled = false;
    }
  }
  if (path === 'uiState.modal') {
    renderModal(value, state);
  }
  if (path === 'uiState.readedPosts') {
    const [lastReadedId] = state.uiState.readedPosts;
    const [post] = state.feedsData.posts.filter(({ id }) => id === lastReadedId);
    const { link } = post;
    const linkEl = document.querySelector(`a[href="${link}"]`);
    linkEl.classList.remove('fw-bold');
    linkEl.classList.add('fw-normal');
  }
};
