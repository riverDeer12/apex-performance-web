/**
 * Client's goal and plan written by the coach,
 * all fields are null until the coach writes it.
 */
export class ClientGoal {
    clientId!: string;
    goal!: string | null;
    currentBlock!: string | null;
    focus!: string | null;
    nextAssessment!: string | null;
    nextAssessmentDate!: string | null;
    updatedAt!: string | null;
}

export interface ClientGoalRequest {
    goal: string | null;
    currentBlock: string | null;
    focus: string | null;
    nextAssessment: string | null;
    nextAssessmentDate: string | null;
}
