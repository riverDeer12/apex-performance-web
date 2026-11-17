import { User } from "../../users/models/user";
import { Coach } from "../../coaches/models/coach";

export class Client {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phone!: string;
  credits!: number;
  plan!: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: User;
  coaches!: Coach[];
  isDeleted!: boolean;
  fullName!: string;
  // Profile picture link, null without a picture.
  pictureUrl?: string | null;
  lastCreditsIncrease!: Date;

  get status(): string {
    return this.isDeleted ? "Inactive" : "Active";
  }
}
