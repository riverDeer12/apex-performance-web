export class AuthResponse {
    token!: string;
    exp!: number;
    nameid!: string;
    name!: string;
    role!: string | string[];
    nbf!: number;
    iat!: number;
    permissions!: string[];
}
