import Misc from './';

describe('Miscellaneous', () => {
  test('Create aws safe function name', done => {
    const isSafe = str => /^[a-zA-Z][a-zA-Z0-9]*$/.test(str);

    const functionIds = [
      'simple-function-name',
      'function-name-with-numbers-101-20',
      '10-20-30-numbers-at-start',
      'lots/of$symbols(in)this=function?.name!!"',
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
