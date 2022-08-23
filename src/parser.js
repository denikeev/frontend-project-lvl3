const genFeed = (document) => {
  const titleEl = document.querySelector('channel > title');
  const descriptionEl = document.querySelector('channel > description');
  const title = titleEl.textContent;
  const description = descriptionEl.textContent;
  const feed = { title, description };

  return feed;
};

const genPosts = (document) => {
  const itemsEl = document.querySelectorAll('item');
  const posts = Array.from(itemsEl).map((item) => {
    const titleEl = item.querySelector('title');
    const descriptionEl = item.querySelector('description');
    const linkEl = item.querySelector('link');
    const title = titleEl.textContent;
    const description = descriptionEl.textContent;
    const link = linkEl.textContent;

    return { title, description, link };
  });

  return posts;
};

export default (data) => {
  const parsedDom = new DOMParser();
  const parsedDocument = parsedDom.parseFromString(data, 'application/xml');
  const errorNode = parsedDocument.querySelector('parsererror');
  if (errorNode) {
    throw new Error('parsingFailed');
  }
  const feed = genFeed(parsedDocument);
  const posts = genPosts(parsedDocument);

  const parsedData = { feed, posts };
  return parsedData;
};
