import { DayOfWeek } from '../../enums/day-of-week';

export class DateExtensions {
    static addTimeToDate(base: Date, timeStr: string): Date {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);

        const totalMilliseconds =
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000) +
            ((seconds || 0) * 1000);

        return new Date(base.getTime() + totalMilliseconds);
    }

    static getWeekDates(base: Date = new Date(), weekStartsOn: 0|1|2|3|4|5|6 = 1): Date[] {
        // normalize to local midnight to avoid time-of-day/DST surprises
        const localMidnight = new Date(base.getFullYear(), base.getMonth(), base.getDate());
        const day = localMidnight.getDay();
        const diff = (day - weekStartsOn + 7) % 7;
        const start = new Date(localMidnight);
        start.setDate(localMidnight.getDate() - diff);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    }

    static getWeekDays(firstDay: DayOfWeek): { name: string; value: DayOfWeek }[] {
        const days = Object.keys(DayOfWeek)
            .filter((key) => isNaN(Number(key)))
            .map((name) => ({
                name,
                value: DayOfWeek[name as keyof typeof DayOfWeek],
            }));
        const startIndex = days.findIndex(d => d.value === firstDay);
        return [...days.slice(startIndex), ...days.slice(0, startIndex)];
    }
}