import { describe, expect, it } from 'vitest';
import { getI18nPath } from './Helpers';

describe('Helpers', () => {
  describe('getI18nPath', () => {
    it('should not change the path', () => {
      const url = '/random-url';

      expect(getI18nPath(url)).toBe(url);
    });
  });
});
