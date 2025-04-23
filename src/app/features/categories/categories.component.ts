import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {InputTextModule} from "primeng/inputtext";
import {MultiSelectModule} from "primeng/multiselect";
import {ProgressBarModule} from "primeng/progressbar";
import {RatingModule} from "primeng/rating";
import {RippleModule} from "primeng/ripple";
import {SelectModule} from "primeng/select";
import {SliderModule} from "primeng/slider";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";
import {ToggleButtonModule} from "primeng/togglebutton";
import {Category} from "./models/category";
import {CategoryService} from "./services/category.service";
import {DatePipe} from "@angular/common";
import {DialogService} from "primeng/dynamicdialog";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {ConfirmationService, MessageService} from 'primeng/api';
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        MultiSelectModule,
        ProgressBarModule,
        RatingModule,
        RippleModule,
        SelectModule,
        SliderModule,
        TableModule,
        TagModule,
        ToggleButtonModule,
        DatePipe
    ],
    providers: [DialogService],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
    @Input() categories!: Category[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(
        private categoryService: CategoryService,
        private messageService: MessageService,
        private helperService: HelperService,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService
    ) {
    }

    ngOnInit(): void {
        this.loadData();
        this.getDataStatus();
    }

    openCreateDialog() {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Add New Category',
            data: {
                contentType: EntityType.Category,
                formType: ActionType.Create,
                dialogId: 'createCategoryForm'
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    openInfoDialog(category: Category) {
        this.dialogService.open(DialogInfoComponent, {
            header: 'Details for: ' + category.name,
            data: {
                contentType: EntityType.Category,
                data: category
            }
        });
    }

    openUpdateDialog(category: Category) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + category.id,
            data: {
                contentType: EntityType.Category,
                formType: ActionType.Update,
                dialogId: 'updateCategoryForm',
                data: category
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    confirmDelete(category: Category) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to deactivate this category?',
            header: 'Confirm deletion of ' + category.id,
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Yes',
            },
            accept: () => {
                this.categoryService.deleteCategory(category.id)
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Category has been deactivated.'
                        });
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error deactivating category.'
                        });
                    });
            }
        });
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if (response) {
                this.loadData();
            }
        })
    }

    private loadData() {
        this.categoryService.getAllCategories().subscribe((response: Category[]) => {
            this.categories = response.map((x: Category) => Object.assign(new Category(), x));
        });
    }
}
