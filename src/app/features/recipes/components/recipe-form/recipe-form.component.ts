import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActionType} from "../../../../enums/action-type";
import {ValidationService} from "../../../../services/validation.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Recipe} from "../../models/recipe";
import {RecipeService} from "../../services/recipe.service";
import {RedirectType} from "../../../../enums/redirect-type";
import {HelperService} from "../../../../services/helper.service";
import {Editor} from "primeng/editor";
import {MultiSelect} from "primeng/multiselect";
import {Category} from "../../../categories/models/category";
import {CategoryService} from "../../../categories/services/category.service";

@Component({
    selector: 'app-recipe-form',
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        ReactiveFormsModule,
        Editor,
        MultiSelect
    ],
    standalone: true,
    templateUrl: './recipe-form.component.html',
    styleUrl: './recipe-form.component.scss'
})
export class RecipeFormComponent {
    @Input() type!: ActionType;
    @Input() recipe!: Recipe;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    categories!: Category[];

    loadingData = false;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private helperService: HelperService,
        private recipeService: RecipeService,
        private categoryService: CategoryService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getCategories();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService
                .add({
                    severity: 'warn',
                    summary: 'Incomplete or incorrect data',
                    sticky: true,
                    detail: 'Check the entered data and try again.'
                });

            this.loadingData = false;

            return;
        }

        this.type == ActionType.Create ?
            this.createRecipe() : this.updateRecipe();
    }

    private initForm = () => this.type == ActionType.Create ?
        this.initCreateForm() : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            title: ['', [Validators.required]],
            content: ['', [Validators.required]],
            categories: ['', [Validators.required]]
        })
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            title: [this.recipe.title, [Validators.required]],
            content: [this.recipe.content, [Validators.required]],
            categories: [this.recipe.categories?.map(x => x.id), [Validators.required]]
        })
    }

    private createRecipe() {
        this.recipeService.createRecipe(this.form.value).subscribe({
            next: (response: Recipe) => {
                this.recipe = Object.assign(new Recipe(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Recipe is created successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Creating Recipe',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private updateRecipe() {
        this.recipeService.updateRecipe(this.recipe.id, this.form.value).subscribe({
            next: (response: Recipe) => {
                this.recipe = Object.assign(new Recipe(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Recipe is updated successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Updating Recipe',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }


    private getCategories() {
        this.categoryService.getAllCategories().subscribe((response: Category[]) => {
            this.categories = response.map((x: Category) =>
                Object.assign(new Category(), x)
            );
        })
    }
}
