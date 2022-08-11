import { uniqueId } from 'lodash';

const isNewElement = (coll, data, property) => !coll.some((item) => item[property] === data);

const processFeeds = (document, feeds) => {
  const titleEl = document.querySelector('channel > title');
  const descriptionEl = document.querySelector('channel > description');
  const title = titleEl.textContent;
  const description = descriptionEl.textContent;

  if (isNewElement(feeds, title, 'title')) {
    feeds.unshift({ title, description, id: uniqueId() });
  }

  return feeds;
};

const processPosts = (document, posts) => {
  const itemsEl = document.querySelectorAll('item');
  itemsEl.forEach((item) => {
    const titleEl = item.querySelector('title');
    const descriptionEl = item.querySelector('description');
    const linkEl = item.querySelector('link');
    const title = titleEl.textContent;
    const description = descriptionEl.textContent;
    const link = linkEl.textContent;

    if (isNewElement(posts, link, 'link')) {
      posts.unshift({
        title,
        description,
        link,
        id: uniqueId(),
      });
    }
  });

  return posts;
};

export default (parsedDocument, state) => {
  const feedsData = processFeeds(parsedDocument, state.feeds);
  const postsData = processPosts(parsedDocument, state.posts);
  const normalizedData = { feeds: feedsData, posts: postsData };

  return normalizedData;
};
