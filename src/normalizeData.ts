import { uniqueId } from 'lodash';

const setIds = (coll) => coll.map((item) => ({ ...item, id: uniqueId() }));

const getNewData = (dataBefore, dataAfter, comparableKey) => {
  const filtered = dataBefore
    .filter((item) => !dataAfter.some((el) => el[comparableKey] === item[comparableKey]));
  const newData = setIds(filtered);

  return newData;
};

const addNewFeed = (parsedData, state, link) => {
  const getFeed = () => ({ ...parsedData.feed, link, id: uniqueId() });
  const newFeed = getFeed();
  const newPosts = setIds(parsedData.posts);
  const feeds = [newFeed].concat(state.feeds);
  const posts = newPosts.concat(state.posts);

  return { feeds, posts };
};

const getNewPosts = (parsedPosts, statePosts) => getNewData(parsedPosts, statePosts, 'link');

export { addNewFeed, getNewPosts };
