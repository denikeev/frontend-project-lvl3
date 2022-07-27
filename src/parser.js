const isNewElement = (coll, data, property) => !coll.some((item) => item[property] === data);

const genFeeds = (document, feeds) => {
  const titleEl = document.querySelector('channel > title');
  const descriptionEl = document.querySelector('channel > description');
  const title = titleEl.textContent;
  const description = descriptionEl.textContent;
  const feedsData = feeds;

  if (isNewElement(feedsData, title, 'title')) {
    feedsData.unshift({ title, description });
  }

  return feedsData;
};

const genPosts = (document, posts) => {
  const postsData = posts;

  const newPosts2 = [];
  const itemsEl = document.querySelectorAll('item');
  itemsEl.forEach((item) => {
    const titleEl = item.querySelector('title');
    const descriptionEl = item.querySelector('description');
    const linkEl = item.querySelector('link');
    const title = titleEl.textContent;
    const description = descriptionEl.textContent;
    const link = linkEl.textContent;
    if (isNewElement(postsData, link, 'link')) {
      newPosts2.push({
        title,
        description,
        link,
      });
    }
  });

  if (newPosts2.length !== 0) {
    postsData.unshift(...newPosts2);
  }

  return postsData;
};

export default (data, state) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');

  const { feeds, posts } = state;
  const feedsData = genFeeds(document, feeds);
  const postsData = genPosts(document, posts);
  const content = { feeds: feedsData, posts: postsData };
  return content;
};
