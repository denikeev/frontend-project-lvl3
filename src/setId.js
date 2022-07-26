import { uniqueId } from 'lodash';

export default (data) => {
  const { feeds: feedsItems, posts: postsItems } = data;

  const feeds = feedsItems.map((el) => {
    el.id = el.id ?? uniqueId();
    return el;
  });
  const posts = postsItems.map((el) => {
    el.id = el.id ?? uniqueId();
    return el;
  });

  return { feeds, posts };
};
