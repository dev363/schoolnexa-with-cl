import { LanguageCode, TranslationSchema, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { ar } from './locales/ar';
import { hi } from './locales/hi';
import { de } from './locales/de';
import { zh } from './locales/zh';

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en,
  es,
  fr,
  ar,
  hi,
  de,
  zh,
};

export { SUPPORTED_LANGUAGES };
export type { LanguageCode, LanguageOption, TranslationSchema };
