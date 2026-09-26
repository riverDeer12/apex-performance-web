import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {Workout, WorkoutRequest} from "../models/workout";
import {WorkoutType} from "../models/workout-type";

@Injectable({
    providedIn: 'root'
})
export class WorkoutService {

    constructor(private http: HttpClient) {
    }

    getWorkouts = () =>
        this.http.get<Workout[]>(environment.apiUrl + "/workouts");

    getWorkoutTypes = () =>
        this.http.get<WorkoutType[]>(environment.apiUrl + "/workout-types");

    createWorkout = (request: WorkoutRequest) =>
        this.http.post<Workout>(environment.apiUrl + "/workouts", request);

    updateWorkout = (workoutId: string, request: WorkoutRequest) =>
        this.http.put<Workout>(environment.apiUrl + "/workouts/" + workoutId, request);

    deleteWorkout = (workoutId: string) =>
        this.http.delete(environment.apiUrl + "/workouts/" + workoutId);
}
