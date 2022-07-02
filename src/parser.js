export default (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  return document;
};

export const isValidDocument = (doc) => {
  const errorNode = doc.querySelector('parsererror');
  return errorNode === null;
};
