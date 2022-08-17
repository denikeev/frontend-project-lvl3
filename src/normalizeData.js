import { uniqueId } from 'lodash';

const getNewData = (dataBefore, dataAfter, comparableKey) => {
  const newData = dataBefore
    .filter((item) => !dataAfter.some((el) => el[comparableKey] === item[comparableKey]))
    .map((item) => ({ ...item, id: uniqueId() }));

  return newData;
};

const getNewPosts = (parsedPosts, statePosts) => getNewData(parsedPosts, statePosts, 'link');
const getNewFeed = (parsedFeed, stateFeed) => getNewData(parsedFeed, stateFeed, 'title');

export { getNewFeed, getNewPosts };
