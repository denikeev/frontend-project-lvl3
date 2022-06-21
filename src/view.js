export default (elements) => (path, value) => {
  if (path === 'error') {
    value.url.then((d) => console.log(d));
  }
};
