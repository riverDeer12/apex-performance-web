import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DialogHelperService {

    dialogCloseStatus: Subject<string> = new Subject<string>();

    constructor() {
    }

    /**
     * Method that triggers
     * dialog if action is successfully
     * finished.
     *
     * @param dialogId id of dialog
     * that needs to be closed.
     */
    closeDialog = (dialogId: string) => this.dialogCloseStatus.next(dialogId);

    /**
     * Method that listens on
     * dialog close status changes.
     */
    getDialogStatus = () => this.dialogCloseStatus;
}
