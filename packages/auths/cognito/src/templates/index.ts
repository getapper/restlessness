const sessionModelTemplate = (): string => `export default class JwtSession {
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

const appUserPoolsManagerTemplate = (): string => `import { UserPoolsManager } from '@restlessness/auth-cognito';

class AppUserPoolsManager extends UserPoolsManager {
  get poolInfos() {
    return [
      {
        id: 'user',
        attributes: [],
      },
    ];
  }
};

export default new AppUserPoolsManager();
`;

export {
  sessionModelTemplate,
  appUserPoolsManagerTemplate,
};
