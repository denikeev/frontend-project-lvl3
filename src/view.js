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
      <a href=${post.link} class="${!!post.readed ? 'fw-normal' : 'fw-bold'}" target="_blank">${post.titles}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id="${post.id}">
      Просмотр
    </button>
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

const renderModal = (value, state) => {
  console.log('datas>>>', state.feedsData.posts);
  const { titles, descriptions, link } = value[0];
  const modal = document.getElementById('modal');
  const title = modal.querySelector('.modal-title');
  const body = modal.querySelector('.modal-body');
  const linkButton = modal.querySelector('.full-article');
  const linkEl = document.querySelector(`a[href="${link}"]`);
  linkEl.classList.remove('fw-bold');
  linkEl.classList.add('fw-normal');
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('style', 'display: block');
  modal.classList.add('show');
  title.textContent = titles;
  body.textContent = descriptions;
  linkButton.setAttribute('href', link);

  const closeButtons = modal.querySelectorAll('button[data-bs-dismiss="modal"]');
  closeButtons.forEach((closeBtn) => {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');
      modal.removeAttribute('role');
      modal.setAttribute('style', 'display: none');
      modal.classList.remove('show');
    });
  });
};

export default (state, elements, path, value, prevValue) => {
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
  if (path === 'uiState.readedPosts') {
    console.log(state);
    renderModal(value, state);
  }
};
