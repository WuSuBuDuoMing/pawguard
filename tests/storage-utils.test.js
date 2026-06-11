const { get } = require('../utils/storage-utils');

describe('storage-utils', () => {
  beforeEach(() => {
    wx.getStorageSync.mockReset();
    wx.setStorageSync.mockReset();
    wx.removeStorageSync.mockReset();
  });

  describe('get', () => {
    test('returns value from storage', () => {
      wx.getStorageSync.mockReturnValue('hello');
      expect(get('key')).toBe('hello');
    });
    test('returns default when empty', () => {
      wx.getStorageSync.mockReturnValue('');
      expect(get('key', 'default')).toBe('default');
    });
    test('handles expired cache', () => {
      wx.getStorageSync.mockReturnValue({ __expiry__: Date.now() - 1000, value: 'old' });
      const result = get('key', 'default');
      expect(result).toBe('default');
      expect(wx.removeStorageSync).toHaveBeenCalledWith('key');
    });
    test('returns value from non-expired cache', () => {
      wx.getStorageSync.mockReturnValue({ __expiry__: Date.now() + 100000, value: 'fresh' });
      expect(get('key')).toBe('fresh');
    });
    test('returns null on error', () => {
      wx.getStorageSync.mockImplementation(() => { throw new Error('fail'); });
      expect(get('key')).toBeNull();
    });
  });
});
