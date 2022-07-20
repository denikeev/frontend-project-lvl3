const genId = (arr) => (arr.length === 0 ? 1 : arr.length + 1);
const isNewElement = (coll, data, property) => !coll.some((item) => item[property] === data);

const genFeeds = (document, feeds) => {
  const feedsData = feeds;
  const titlePath = '//channel/title';
  const descriptionPath = '//channel/description';
  const feedTitle = document.evaluate(
    titlePath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );
  const feedDescription = document.evaluate(
    descriptionPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );

  const title = feedTitle.singleNodeValue.textContent;

  if (isNewElement(feedsData, title, 'title')) {
    const id = genId(feedsData);
    const description = feedDescription.singleNodeValue.textContent;
    feedsData.unshift({ title, description, id });
  }

  return feedsData;
};

const genPosts = (document, posts) => {
  const postsData = posts;
  const titlePath = '//channel/item/title';
  const descriptionsPath = '//channel/item/description';
  const postLinksPath = '//channel/item/link';
  const postTitle = document.evaluate(
    titlePath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );
  const postDescription = document.evaluate(
    descriptionsPath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );
  const postLink = document.evaluate(
    postLinksPath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  let currentTitle = postTitle.iterateNext();
  let currentDescription = postDescription.iterateNext();
  let currentLink = postLink.iterateNext();

  const newPosts = [];
  for (let id = genId(postsData); currentTitle && currentDescription && currentLink; id += 1) {
    const title = currentTitle.textContent;
    const description = currentDescription.textContent;
    const link = currentLink.textContent;
    if (isNewElement(postsData, link, 'link')) {
      newPosts.push({
        title,
        description,
        id,
        feedId: id,
        link,
      });
    }
    currentTitle = postTitle.iterateNext();
    currentDescription = postDescription.iterateNext();
    currentLink = postLink.iterateNext();
  }
  if (newPosts.length !== 0) {
    postsData.unshift(...newPosts);
  }

  return postsData;
};

export default (document, data) => {
  const { feeds, posts } = data;

  const feedsData = genFeeds(document, feeds);
  const postsData = genPosts(document, posts);

  const content = { feeds: feedsData, posts: postsData };
  return content;
};
