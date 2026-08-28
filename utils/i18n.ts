export function useT(lang: string) {
  let dict: any = {};
  try { dict = require(`../locales/${lang}.json`); } catch { dict = require('../locales/en.json'); }
  return function t(key: string) { return dict[key] ?? key; };
}
