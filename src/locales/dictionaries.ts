

const dictionaries = {
  en: () => import('./en.json').then((module) => module.default),
  ja: () => import('./ja.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  // Fallback to ja if locale is not supported
  if (!(locale in dictionaries)) {
    return dictionaries.ja();
  }
  return dictionaries[locale as keyof typeof dictionaries]();
};
