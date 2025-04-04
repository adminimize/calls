import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";

// Function to calculate days between dates
export function getDaysBetween(date1: CalendarDate, date2: CalendarDate): number {
    const d1 = new Date(date1.toString());
    const d2 = new Date(date2.toString());
    const diffTime = d1.getTime() - d2.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Convert any DateValue to CalendarDate
export function toCalendarDate(value: DateValue): CalendarDate {
    return value instanceof CalendarDate 
        ? value 
        : new CalendarDate(value.era, value.year, value.month, value.day);
}

// Get relative time message
export function getRelativeTimeMessage(value: DateValue | undefined): string {
    if (!value) return '';
    
    const now = today(getLocalTimeZone());
    const selectedDate = toCalendarDate(value);
    const days = getDaysBetween(selectedDate, now);
    
    // Future dates
    if (days > 0) {
        if (days === 1) return 'tomorrow';
        if (days === 2) return 'in 2 days';
        if (days <= 6) return `in ${days} days`;
        if (days <= 13) return 'next week';
        if (days <= 30) {
            const weeks = Math.ceil(days / 7);
            return weeks === 1 ? 'next week' : `in ${weeks} weeks`;
        }
        if (days <= 60) return 'next month';
        if (days <= 365) {
            const months = Math.ceil(days / 30);
            return months === 1 ? 'next month' : `in ${months} months`;
        }
        const years = Math.ceil(days / 365);
        return years === 1 ? 'next year' : `in ${years} years`;
    }
    
    // Past dates
    if (days < 0) {
        const absDays = Math.abs(days);
        if (absDays === 1) return 'yesterday';
        if (absDays === 2) return '2 days ago';
        if (absDays <= 6) return `${absDays} days ago`;
        if (absDays <= 13) return 'last week';
        if (absDays <= 30) {
            const weeks = Math.ceil(absDays / 7);
            return weeks === 1 ? 'last week' : `${weeks} weeks ago`;
        }
        if (absDays <= 60) return 'last month';
        if (absDays <= 365) {
            const months = Math.ceil(absDays / 30);
            return months === 1 ? 'last month' : `${months} months ago`;
        }
        const years = Math.ceil(absDays / 365);
        return years === 1 ? 'last year' : `${years} years ago`;
    }
    
    return 'today';
} 