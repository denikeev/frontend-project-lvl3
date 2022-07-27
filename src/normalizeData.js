import { uniqueId } from 'lodash';

const setId = (data) => data.map((el) => {
  el.id = el.id ?? uniqueId();
  return el;
});

export default (data) => {
  const { feeds: feedsItems, posts: postsItems } = data;

  const feeds = setId(feedsItems);
  const posts = setId(postsItems);

  return { feeds, posts };
};
