const indexTemplate = (name: string): string => `export default class ${name} {
  ['constructor']: typeof ${name}
};
`;

export {
  indexTemplate,
};
