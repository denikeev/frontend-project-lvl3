const setId = (arr) => {
  if (arr.length === 0) {
    return 1;
  }
  return arr.length + 1;
};

export default (document, data) => {
  const { feeds, posts } = data;
  const channelTitlePath = '//channel/title';
  const channelDescriptionPath = '//channel/description';

  const channelTitle = document.evaluate(
    channelTitlePath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );

  const title = channelTitle.singleNodeValue.textContent;
  let id;
  if (!feeds.some((feed) => feed.title === title)) {
    id = setId(feeds);

    const channelDescription = document.evaluate(
      channelDescriptionPath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    const description = channelDescription.singleNodeValue.textContent;
    feeds.unshift({ title, description, id });
  } else {
    feeds.forEach((feed) => {
      if (feed.title === title) {
        id = feed.id;
      }
    });
  }

  const itemsTitlePath = '//channel/item/title';
  const itemTitles = document.evaluate(
    itemsTitlePath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  const itemsDescriptionsPath = '//channel/item/description';
  const itemDescriptions = document.evaluate(
    itemsDescriptionsPath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  const itemsLinksPath = '//channel/item/link';
  const itemLinks = document.evaluate(
    itemsLinksPath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null,
  );

  let currentTitle = itemTitles.iterateNext();
  let currentDescription = itemDescriptions.iterateNext();
  let currentLink = itemLinks.iterateNext();

  const newPosts = [];
  for (let ids = setId(posts); currentTitle && currentDescription && currentLink; ids += 1) {
    const titles = currentTitle.textContent;
    const descriptions = currentDescription.textContent;
    const link = currentLink.textContent;
    if (!posts.some((post) => post.link === link)) {
      newPosts.push({
        titles,
        descriptions,
        ids,
        feedId: id,
        link,
      });
    }
    currentTitle = itemTitles.iterateNext();
    currentDescription = itemDescriptions.iterateNext();
    currentLink = itemLinks.iterateNext();
  }
  if (newPosts.length !== 0) {
    posts.unshift(...newPosts);
  }

  console.log({ feeds, posts });
  return { feeds, posts };
};
