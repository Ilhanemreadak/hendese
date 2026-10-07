/* Hendese · Strings: UI text. English by default; a page whose <html lang> is Turkish ("tr", "tr-TR") gets the Turkish set.
   Override any entry with Hendese.init({strings:{…}}). */
export const locales = {
  en: { intro: 'Intro', copy: 'Copy', copied: 'Copied', copyFail: 'Copy failed', toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
  tr: { intro: 'Giriş', copy: 'Kopyala', copied: 'Kopyalandı', copyFail: 'Kopyalanamadı', toLight: 'Açık temaya geç', toDark: 'Koyu temaya geç' }
};
export const strings = Object.assign({}, locales.en);
