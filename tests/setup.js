global.wx = {
  getStorageSync: jest.fn(() => ''),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({ theme: 'light' })),
  showToast: jest.fn(),
};
