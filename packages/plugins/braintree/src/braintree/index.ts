class Braintree {
  init() {}

  test() {
    console.log('ok');
  }
}

const braintree = new Braintree();

export default () => {
  braintree.init();
  return braintree;
};
