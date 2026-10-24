import {HttpClient, HttpContext} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {Workout, WorkoutRequest} from "../models/workout";
import {WorkoutType} from "../models/workout-type";
import {ImportWorkoutsResponse} from "../models/import-workouts-response";
import {SKIP_LOADER} from "../../../interceptors/default.interceptor";

@Injectable({
    providedIn: 'root'
})
export class WorkoutService {

    constructor(private http: HttpClient) {
    }

    // Without the loading overlay where the page shows its own (the chat workout picker).
    getWorkouts = (showLoader = true) =>
        this.http.get<Workout[]>(environment.apiUrl + "/workouts",
            {context: new HttpContext().set(SKIP_LOADER, !showLoader)});

    getWorkoutTypes = () =>
        this.http.get<WorkoutType[]>(environment.apiUrl + "/workout-types");

    createWorkoutType = (request: { nameHr: string; nameEn: string | null }) =>
        this.http.post<{ id: string }>(environment.apiUrl + "/workout-types", request);

    updateWorkoutType = (workoutTypeId: string, request: { nameHr: string; nameEn: string | null }) =>
        this.http.put(environment.apiUrl + "/workout-types/" + workoutTypeId, request);

    deleteWorkoutType = (workoutTypeId: string) =>
        this.http.delete(environment.apiUrl + "/workout-types/" + workoutTypeId);

    createWorkout = (request: WorkoutRequest) =>
        this.http.post<Workout>(environment.apiUrl + "/workouts", request);

    updateWorkout = (workoutId: string, request: WorkoutRequest) =>
        this.http.put<Workout>(environment.apiUrl + "/workouts/" + workoutId, request);

    importWorkouts = (file: File) => {
        const formData = new FormData();
        formData.append("file", file, file.name);

        return this.http.post<ImportWorkoutsResponse>(environment.apiUrl + "/workouts/import", formData);
    };

    deleteWorkout = (workoutId: string) =>
        this.http.delete(environment.apiUrl + "/workouts/" + workoutId);
}
