import {Component} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActionType} from "../../enums/action-type";
import {CategoryFormComponent} from "../../features/categories/components/category-form/category-form.component";
import {EntityType} from "../../enums/entity-type";
import {CommonModule} from "@angular/common";
import {DialogFormConfig} from "../../constants/dialog-form-config";
import {RecipeFormComponent} from "../../features/recipes/components/recipe-form/recipe-form.component";
import {
    AdministratorFormComponent
} from "../../features/administrators/components/administrator-form/administrator-form.component";
import {UserFormComponent} from "../../features/users/components/user-form/user-form.component";
import {RedirectType} from "../../enums/redirect-type";
import {DialogHelperService} from "../../services/dialog-helper.service";
import {RoleFormComponent} from "../../features/roles/roles/components/role-form/role-form.component";

@Component({
    selector: 'app-dialog-form',
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        CategoryFormComponent,
        RecipeFormComponent,
        AdministratorFormComponent,
        UserFormComponent,
        RoleFormComponent
    ],
    standalone: true,
    templateUrl: './dialog-form.component.html',
    styleUrl: './dialog-form.component.scss'
})
export class DialogFormComponent {
    contentType!: EntityType;
    dialogId!: string;
    formType!: ActionType;
    data: any;

    redirectType = RedirectType.CloseDialog;

    public get entityType(): typeof EntityType {
        return EntityType;
    }

    constructor(private dialogRef: DynamicDialogRef,
                private dialogHelperService: DialogHelperService,
                private dialogConfig: DynamicDialogConfig) {
        this.initSettings();
        this.initContentType();
        this.setDialogCloseListener();
    }

    ngOnInit(): void {
        //intended
    }

    /**
     * Set dialog settings.
     */
    initSettings(): void {
        this.dialogConfig.autoZIndex = DialogFormConfig.autoZIndex;
        this.dialogConfig.dismissableMask = DialogFormConfig.dismissableMask;
        this.dialogConfig.closeOnEscape = DialogFormConfig.closeOnEscape;
        this.dialogConfig.transitionOptions = DialogFormConfig.transitionOptions;
        this.dialogConfig.style = DialogFormConfig.style;
        this.dialogConfig.draggable = DialogFormConfig.draggable;
        this.dialogConfig.resizable = DialogFormConfig.resizable;
    }


    /**
     * Set dialog content type.
     */
    initContentType(): void {
        this.contentType = this.dialogConfig.data.contentType;
        this.formType = this.dialogConfig.data.formType;
        this.data = this.dialogConfig.data.data;
        this.dialogId = this.dialogConfig.data.dialogId;
    }

    /**
     * Set listener for
     * close dialog event.
     */
    setDialogCloseListener(): void {
        this.dialogHelperService.getDialogStatus().subscribe((response: string) => {
            if (this.dialogId === response as string) {
                this.dialogRef.close(response);
            }
        })
    }

    cancel(): void {
        this.dialogRef.close();
    }

}
