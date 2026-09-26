/**
 * Mirrors API LocalizedProperty.
 * Translations are keyed by
 * API language code (HR, EN, IT).
 */
export class LocalizedProperty {
    translations: Record<string, string> = {};
}

/**
 * Get translation for given language,
 * falling back to croatian and then
 * to any available translation.
 *
 * @param property localized property from API
 * or raw JSON string of translations.
 * @param language app language ("hr" or "en").
 */
export function getTranslation(property: LocalizedProperty | string | null | undefined,
                               language: string): string {
    const translations = toTranslations(property);

    const find = (code: string) =>
        Object.entries(translations)
            .find(([key, value]) => key.toUpperCase() === code && !!value)?.[1];

    return find(language.toUpperCase())
        ?? find("HR")
        ?? Object.values(translations).find(value => !!value)
        ?? "";
}

/**
 * Some API responses (e.g. workout types on workout)
 * return localized value as persisted JSON string
 * instead of LocalizedProperty object.
 */
function toTranslations(property: LocalizedProperty | string | null | undefined): Record<string, string> {
    if (!property) return {};

    if (typeof property !== "string") return property.translations ?? {};

    if (!property.trim().startsWith("{")) return {HR: property};

    try {
        return JSON.parse(property) ?? {};
    } catch {
        return {HR: property};
    }
}
