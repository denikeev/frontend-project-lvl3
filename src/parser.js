export default (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  return document;
};
