// js/modules/utils.js

/** Converts array/value to JSON string for display in textarea */
export const formatArr = (val) =>
    Array.isArray(val) ? JSON.stringify(val) : (val || '');

/** Parses a textarea value (JSON array or comma-separated) into an array */
export const parseArray = (val) => {
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    }
};

/**
 * Robustly parses a JSONB field from Supabase that should be an array.
 * Handles: JS array, JSON string, null/undefined.
 */
export const parseJsonbArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try {
            const p = JSON.parse(val);
            return Array.isArray(p) ? p : [];
        } catch { return []; }
    }
    return [];
};

/** Formats a monetary amount as USD */
export const formatUSD = (amount) => `$${Number(amount || 0).toFixed(2)}`;

/** Formats a date string to uk-UA locale */
export const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('uk-UA');

/** Truncates a time slot string to HH:MM */
export const formatTime = (timeSlot) =>
    timeSlot && timeSlot.length > 5 ? timeSlot.substring(0, 5) : (timeSlot || '');