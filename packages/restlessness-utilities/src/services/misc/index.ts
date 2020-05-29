const capitalize = (s: string): string => `${s[0].toUpperCase()}${s.slice(1)}`;
const camelCaseToDash = (s: string): string => s.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

export {
  capitalize,
  camelCaseToDash,
};
