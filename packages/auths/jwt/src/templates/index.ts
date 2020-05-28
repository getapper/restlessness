const jwtAuthorizerTemplate = (): string => `import { authorizer } from '@restlessness/auth-jwt';

const handler = authorizer;

export {
  handler,
};
`;

const jwtSessionModelTemplate = (): string => `export default class JwtSession {
  ['constructor']: typeof JwtSession
  id: string

  async serialize(): Promise<string> {
    return JSON.stringify(this);
  }

  static async deserialize(session: string): Promise<JwtSession> {
    const jwtSession = new JwtSession();
    Object.assign(jwtSession, JSON.parse(session));
    return jwtSession;
  }
};
`;

export {
  jwtAuthorizerTemplate,
  jwtSessionModelTemplate,
};
