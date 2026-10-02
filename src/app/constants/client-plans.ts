/**
 * How the client trains, values match the API.
 */
export class ClientPlans {
    static readonly PrivateCoaching = "PrivateCoaching";
    static readonly OnlineCoaching = "OnlineCoaching";
    static readonly Membership = "Membership";

    static readonly All = [ClientPlans.PrivateCoaching, ClientPlans.OnlineCoaching, ClientPlans.Membership];
}
