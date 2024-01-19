import { createRequire } from 'module';
import { jest } from '@jest/globals';

const require = createRequire(import.meta.url);

test('main', () => {
  jest.doMock('../index', () => jest.fn().mockReturnValueOnce(undefined));
  const main = require('../index');
  main();
  expect(jest.isMockFunction(main)).toBeTruthy();
  expect(main).toHaveBeenCalledTimes(1);
  expect(main()).toBe(undefined);
});
