export interface Authorizer {
  id: string;
  name: string;
  package: string;
}

export interface AuthorizerState {
  list: Authorizer[];
}
