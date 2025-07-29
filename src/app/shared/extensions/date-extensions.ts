export class DateExtensions {
    static addTimeToDate(base: Date, timeStr: string): Date {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);

        const totalMilliseconds =
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000) +
            ((seconds || 0) * 1000);

        return new Date(base.getTime() + totalMilliseconds);
    }
}