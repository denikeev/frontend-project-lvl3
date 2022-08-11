export default (data) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(data, 'application/xml');

  return parsedDocument;
};
