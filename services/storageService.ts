
/**
 * LocalStorage tabanlı basit veri saklama servisi
 */

export const saveData = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Save Error (${key}):`, error);
  }
};

export const loadData = (key: string, defaultValue: unknown) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Load Error (${key}):`, error);
    return defaultValue;
  }
};
