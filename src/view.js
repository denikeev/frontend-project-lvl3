import { isEmpty } from 'lodash';

const renderFeeds = (elements, value, prevValue) => {
  const hasPrevValue = Boolean(prevValue);
  if (hasPrevValue) {
    document.body.lastChild.remove();
  }
  const { feeds, posts } = value;

  const main = document.querySelector('.main');
  const section = document.createElement('section');
  section.classList.add('container');
  const sectionHtml = `
    <div class="row">
      <div class="col-lg-8">
        <h2 class="h4">Фиды</h2>
        <ul class="feeds">
        </ul>
      </div>
      <div class="col-lg-8">
        <ul class="posts">
        </ul>
      </div>
    </div>`;
  section.innerHTML = sectionHtml;
  main.after(section);

  const feedsContent = feeds.reduce((acc, feed) => `
    ${acc}
    <li>
      <h3 class="h5">${feed.title}</h3>
      <p class="small">${feed.description}</p>
    </li>`, '').trim();

  const feedsElement = document.querySelector('.feeds');
  feedsElement.innerHTML = feedsContent;

  const postsContent = posts.reduce((acc, post) => `
    ${acc}
    <li>
      <a href=${post.link}>${post.titles}</a>
    </li>`, '');

  const postsElement = document.querySelector('.posts');
  postsElement.innerHTML = postsContent;
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
