import {Injectable} from '@angular/core';
import {RedirectType} from "../enums/redirect-type";
import {Router} from "@angular/router";
import {DialogHelperService} from "./dialog-helper.service";
import {Observable, Subject} from "rxjs";
import {List} from "postcss/lib/list";

@Injectable({
    providedIn: 'root'
})
export class HelperService {

    dataRefresh: Subject<boolean> = new Subject<boolean>();

    constructor(private router: Router,
                private dialogHelperService: DialogHelperService) {
    }

    /**
     * Redirect user after form
     * submit based on redirect type.
     *
     * @param redirectType type of redirection.
     * @param returnUrl url for redirecting user.
     * @param dialogId id of dialog that needs to be closed.
     */
    redirectUserAfterSubmit(redirectType: RedirectType, returnUrl?: string, dialogId?: string): void {
        switch (redirectType) {
            case RedirectType.NoRedirect:
                return;
            case RedirectType.Page:
                this.router.navigateByUrl(returnUrl as string).then();
                return;
            case RedirectType.CloseDialog:
                this.dialogHelperService.closeDialog(dialogId as string);
                return;
        }
    }

    /**
     * Method that listens on
     * data refresh changes.
     */
    getDataStatus = () => this.dataRefresh;

    /**
     * Method that triggers
     * data refresh if something
     * changes regarding data status.
     *
     * @param refresh flag
     * that triggers data load.
     */
    triggerDataRefresh = (refresh: boolean) => this.dataRefresh.next(refresh);
}
