/**
 * Transliterate Russian text to Latin characters
 */
export const transliterate = (text) => {
  const ru = 'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-');
  const en = 'A-a-B-b-V-v-G-g-D-d-E-e-E-e-ZH-zh-Z-z-I-i-J-j-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch- - -Y-y- - -E-e-YU-yu-YA-ya'.split('-');
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const index = ru.indexOf(char);
    result += index !== -1 ? en[index] : char;
  }
  return result;
};

/**
 * Detect if text is in Russian or English
 */
export const detectLanguage = (text) => {
  const cyrillicPattern = /[а-яА-ЯЁё]/;
  const latinPattern = /[a-zA-Z]/;
  
  if (cyrillicPattern.test(text)) {
    return 'ru';
  } else if (latinPattern.test(text)) {
    return 'en';
  }
  return 'unknown';
};

/**
 * Get most common value from array
 */
export const getMostCommon = (arr) => {
  if (!arr || arr.length === 0) return '';
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
};
