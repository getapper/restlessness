import Misc from './';

describe('Miscellaneous', () => {
  test('Create aws safe function name', done => {
    const isSafe = (str: string) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(str) && str.length <= 64;

    const functionIds = [
      'simple-function-name',
      'function-name-with-numbers-101-20',
      '10-20-30-numbers-at-start',
      'lots/of$symbols(in)this=function?.name!!"',
      'this-function-id-is-really-really-really-long-so-this-part-of-the-string-will-be-discarded',
    ];

    functionIds.forEach(id => {
      const safeFunctionName = Misc.createAwsSafeFunctionName(id, 'service-test-1');
      expect(isSafe(safeFunctionName)).toBe(true);
    });

    expect(
      () => Misc.createAwsSafeFunctionName('10/()$23', 'service-test-1'),
    ).toThrowError();

    done();
  });
});
