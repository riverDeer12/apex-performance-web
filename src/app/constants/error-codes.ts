export const ERROR_CODE_MESSAGES: Record<string, string> = {
    '1000': 'This field is required.',
    '1001': 'This value is not valid.',
    '1002': 'Duplicate values are not allowed.',
    '1100': 'You are not authorized.',
    '1101': 'You are not authorized to perform this action.',
    '1102': 'Incorrect username or password.',
    '1103': 'Your account has not been approved yet.',
    '1104': 'No roles were provided.',
    '1200': 'The requested item was not found.',
    '1201': 'This item has already been changed.',
    '1202': 'User not found.',
    '1300': 'This item already exists.',
    '1301': 'This username already exists.',
    '1302': 'This email already exists.',
    '1400': 'An error occurred while saving.',
    '1401': 'An error occurred while sending the email.',
};

/**
 * Resolves an API error response into a human-readable message.
 * The API returns numeric error codes (see ErrorCodes.cs) as the
 * generalErrors text, so this maps the code to display text - falling
 * back to the raw value for the rare endpoint that already sends plain
 * text, and to a generic message when nothing is present.
 */
export function getErrorMessage(error: any): string {
    const raw = error?.error?.errors?.generalErrors?.[0];
    if (!raw) {
        return 'An unexpected error occurred.';
    }
    return ERROR_CODE_MESSAGES[raw] ?? raw;
}
