import { Client } from "../../models/client";

export class FunctionalMovementScreen {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deepSquat!: string;
  hurdleStep!: string;
  inLineLunge!: string;
  activeStraightLegRaise!: string;
  trunkStabilityPushUp!: string;
  rotaryStability!: string;
  shoulderMobility!: string;
  client!: Client;
}
