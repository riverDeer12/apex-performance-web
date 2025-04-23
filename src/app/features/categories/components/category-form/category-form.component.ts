import {Component, Input} from '@angular/core';
import {ActionType} from "../../../../enums/action-type";
import {Category} from "../../models/category";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {ValidationService} from "../../../../services/validation.service";
import {InputText} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {CommonModule} from "@angular/common";
import {CategoryService} from "../../services/category.service";
import {RedirectType} from "../../../../enums/redirect-type";
import {HelperService} from "../../../../services/helper.service";
import {MultiSelect} from "primeng/multiselect";
import {Recipe} from "../../../recipes/models/recipe";
import {RecipeService} from "../../../recipes/services/recipe.service";
import {Administrator} from "../../../administrators/models/administrator";

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputText,
        ButtonModule,
        MultiSelect
    ],
    templateUrl: './category-form.component.html',
    styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent {
    @Input() type!: ActionType;
    @Input() category!: Category;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    recipes!: Recipe[];

    loadingData = false;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private categoryService: CategoryService,
        private helperService: HelperService,
        private recipeService: RecipeService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getRecipes();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService
                .add({
                    severity: 'warn',
                    summary: 'Incomplete or incorrect data',
                    detail: 'Check the entered data and try again.'
                });

            this.loadingData = false;

            return;
        }

        this.type == ActionType.Create ?
            this.createCategory() : this.updateCategory();
    }

    private initForm = () => this.type == ActionType.Create ?
        this.initCreateForm() : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            recipes: ['']
        })
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            name: [this.category.name, [Validators.required]],
            description: [this.category.description, [Validators.required]],
            recipes: [this.category.recipes?.map(x => x.id)]
        })
    }

    private createCategory() {
        this.categoryService.createCategory(this.form.value).subscribe({
            next: (response: Category) => {
                this.category = Object.assign(new Category(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category is created successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Creating Category',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private updateCategory() {
        this.categoryService.updateCategory(this.category.id, this.form.value).subscribe({
            next: (response: Category) => {
                this.category = Object.assign(new Category(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category is updated successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Updating Category',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }


    private getRecipes() {
        this.recipeService.getAllRecipes().subscribe((response: Recipe[]) => {
            this.recipes = response.map((x: Recipe) =>
                Object.assign(new Recipe(), x)
            );
        })
    }
}
