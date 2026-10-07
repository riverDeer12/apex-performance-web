export class MonthlyReview {
    id!: string;
    clientId!: string;
    year!: number;
    // 1-12
    month!: number;
    content!: string;
    createdAt!: string;
    updatedAt!: string;
}

export interface MonthlyReviewRequest {
    client: string;
    year: number;
    month: number;
    content: string;
}

/**
 * Translation keys of month names, index 0 is January.
 */
export const MonthKeys = [
    "months.january", "months.february", "months.march", "months.april",
    "months.may", "months.june", "months.july", "months.august",
    "months.september", "months.october", "months.november", "months.december",
];
