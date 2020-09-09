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
  appUserPoolsManagerTemplate,
};
