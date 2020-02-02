interface EnvVars {
  isDev: boolean,
  prjPath: string,
}

const readEnv = (): EnvVars => ({
  isDev: process.env.IS_DEV === '1',
  prjPath: process.env.PRJ_PATH,
});

export default readEnv();
