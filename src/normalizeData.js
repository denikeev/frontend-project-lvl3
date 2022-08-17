import { uniqueId } from 'lodash';

const compareData = (dataBefore, dataAfter, comparableKey) => {
  const newData = dataBefore
    .filter((item) => !dataAfter.some((el) => el[comparableKey] === item[comparableKey]))
    .map((item) => ({ ...item, id: uniqueId() }));
  dataAfter.unshift(...newData);

  return dataAfter;
};

export default (parsedData, state) => {
  const feeds = compareData(parsedData.feeds, state.feeds, 'title');
  const posts = compareData(parsedData.posts, state.posts, 'link');

  const normalizedData = { feeds, posts };

  return normalizedData;
};
