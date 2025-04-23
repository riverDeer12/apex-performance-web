import {Component} from '@angular/core';
import {EntityType} from "../../enums/entity-type";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {DialogInfoConfig} from "../../constants/dialog-info-config";
import {CommonModule} from "@angular/common";
import {Button} from "primeng/button";
import {DialogFormComponent} from "../dialog-form/dialog-form.component";
import {ActionType} from "../../enums/action-type";
import {KeyValueDisplayComponent} from "../key-value-display/key-value-display.component";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: 'app-dialog-info',
    imports: [
        CommonModule,
        Button,
        KeyValueDisplayComponent
    ],
    standalone: true,
    templateUrl: './dialog-info.component.html',
    styleUrl: './dialog-info.component.scss'
})
export class DialogInfoComponent {
    contentType!: EntityType;
    data: any;

    constructor(private dialogRef: DynamicDialogRef,
                private dialogService: DialogService,
                private helperService: HelperService,
                private dialogConfig: DynamicDialogConfig) {
        this.initSettings();
        this.initContentType();
    }

    ngOnInit(): void {
        //intended
    }

    /**
     * Set dialog settings.
     */
    initSettings(): void {
        this.dialogConfig.autoZIndex = DialogInfoConfig.autoZIndex;
        this.dialogConfig.dismissableMask = DialogInfoConfig.dismissableMask;
        this.dialogConfig.closeOnEscape = DialogInfoConfig.closeOnEscape;
        this.dialogConfig.transitionOptions = DialogInfoConfig.transitionOptions;
        this.dialogConfig.style = DialogInfoConfig.style;
        this.dialogConfig.draggable = DialogInfoConfig.draggable;
        this.dialogConfig.resizable = DialogInfoConfig.resizable;
    }

    /**
     * Set dialog content type.
     */
    initContentType(): void {
        this.contentType = this.dialogConfig.data.contentType;
        this.data = this.dialogConfig.data.data;
    }

    openUpdateDialog() {

        this.dialogRef.close();

        const updateDialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + this.data["id"],
            data: {
                contentType: this.contentType,
                formType: ActionType.Update,
                data: this.data
            }
        });

        updateDialogRef.onClose.subscribe((response: any) => {
            this.helperService.triggerDataRefresh(true);
        })
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
