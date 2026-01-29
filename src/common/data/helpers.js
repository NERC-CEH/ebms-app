export default function getAttrs(str) {
  const attributes = {};
  const parseAttrs = country => {
    const [key, val] = country.split('=');
    if (!key || !val) return;

    const normKey = key.replace(': ', '_');
    const normVal = val.replace('?', '');

    attributes[normKey] = normVal;
  };

  (str || '').split(' | ').forEach(parseAttrs);

  return attributes;
}
