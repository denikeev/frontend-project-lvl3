// const genId = (arr) => (arr.length === 0 ? 1 : arr.length + 1);
const isNewElement = (coll, data, property) => !coll.some((item) => item[property] === data);

const genFeeds = (document, feeds) => {
  const titleEl = document.querySelector('channel > title');
  const descriptionEl = document.querySelector('channel > description');
  const title = titleEl.textContent;
  const description = descriptionEl.textContent;
  const feedsData = feeds;

  if (isNewElement(feedsData, title, 'title')) {
    // const id = genId(feedsData);
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
        // id,
        link,
      });
    }
  });

  if (newPosts2.length !== 0) {
    postsData.unshift(...newPosts2);
  }

  return postsData;
  // console.log(newPosts2);

  // const titlePath = '//channel/item/title';
  // const descriptionsPath = '//channel/item/description';
  // const postLinksPath = '//channel/item/link';
  // const postTitle = document.evaluate(
  //   titlePath,
  //   document,
  //   null,
  //   XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  //   null,
  // );
  // const postDescription = document.evaluate(
  //   descriptionsPath,
  //   document,
  //   null,
  //   XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  //   null,
  // );
  // const postLink = document.evaluate(
  //   postLinksPath,
  //   document,
  //   null,
  //   XPathResult.ORDERED_NODE_ITERATOR_TYPE,
  //   null,
  // );

  // let currentTitle = postTitle.iterateNext();
  // let currentDescription = postDescription.iterateNext();
  // let currentLink = postLink.iterateNext();

  // const newPosts = [];
  // for (let id = genId(postsData); currentTitle && currentDescription && currentLink; id += 1) {
  //   const title = currentTitle.textContent;
  //   const description = currentDescription.textContent;
  //   const link = currentLink.textContent;
  //   if (isNewElement(postsData, link, 'link')) {
  //     newPosts.push({
  //       title,
  //       description,
  //       id,
  //       feedId: id,
  //       link,
  //     });
  //   }
  //   currentTitle = postTitle.iterateNext();
  //   currentDescription = postDescription.iterateNext();
  //   currentLink = postLink.iterateNext();
  // }
  // if (newPosts.length !== 0) {
  //   postsData.unshift(...newPosts);
  // }

  // return postsData;
};

export default (document, data) => {
  const { feeds, posts } = data;

  const feedsData = genFeeds(document, feeds);
  const postsData = genPosts(document, posts);

  const content = { feeds: feedsData, posts: postsData };
  // console.log(content);
  return content;
};
