export type UrlCode = 'br' | 'us';
export type I18nCode = 'pt-BR' | 'en-US';

export interface Language {
    urlCode: UrlCode;
    i18nCode: I18nCode;
    label: string;
    countryCode: UrlCode;
}

export const languages: readonly Language[] = [
    { urlCode: 'br', i18nCode: 'pt-BR', label: 'Português (BR)', countryCode: 'br' },
    { urlCode: 'us', i18nCode: 'en-US', label: 'English (US)',  countryCode: 'us' },
] as const;

// fallback hardcoded (caso não dê pra detectar o navegador, SSR, etc.)
export const FALLBACK_URL_CODE: UrlCode = 'br';

// alias por língua base → seu padrão
const i18nAliases: Record<string, I18nCode> = {
    'pt': 'pt-BR',
    'en': 'en-US',
};

// Normaliza qualquer string (ex.: 'en-GB', 'pt', 'en')
export function normalizeI18n(code?: string): I18nCode | undefined {
    if (!code) return undefined;
    if (languages.some(l => l.i18nCode === code)) return code as I18nCode;
    const base = code.split('-')[0].toLowerCase();
    return i18nAliases[base];
}

export function getUrlCodeFromI18n(code?: string, fallback?: UrlCode): UrlCode {
    const normalized = normalizeI18n(code);
    const match = languages.find(l => l.i18nCode === normalized);
    return match?.urlCode ?? (fallback ?? FALLBACK_URL_CODE);
}

export function getDefaultUrlCodeFromMachine(): UrlCode {
    if (typeof navigator === 'undefined') return FALLBACK_URL_CODE; // SSR/CI
    const prefs = (navigator.languages && navigator.languages.length > 0)
        ? navigator.languages
        : [navigator.language];

    for (const p of prefs) {
        const url = getUrlCodeFromI18n(p);
        if (url) return url;
    }
    return FALLBACK_URL_CODE;
}
