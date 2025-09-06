import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    /**
     * Class for showing red aligned
     * input if validation is invalid.
     */
    invalidClass = 'ng-invalid ng-dirty';

    constructor() {
    }

    /**
     * Method for checking
     * parent form field errors.
     *
     * @param parentForm name of form group that contains validations.
     * @param fieldName name of form control that needs to be validated.
     * @param errorName name of validation check (required, minLength etc.)
     * @param formGroupName optional form group if you are working with inherited forms.
     */
    hasErrors(parentForm: FormGroup, fieldName: string, errorName: string, formGroupName?: string): boolean {
        if (parentForm && formGroupName === undefined) {
            const field = parentForm.get(fieldName);
            return !!field?.touched && field.hasError(errorName);
        }

        const form = parentForm.get(formGroupName as string) as FormGroup;
        const field = form?.get(fieldName);
        return !!field?.touched && field.hasError(errorName);
    }


    /**
     * Method for getting form input
     * validation error styling class.
     *
     * @param parentForm name of form group that contains validations.
     * @param fieldName name of form control that needs to be validated.
     * @param errorName name of validation check (required, minLength etc.)
     * @param formGroupName optional form group if you are working with inherited forms.
     */
    getInputClass(parentForm: FormGroup, fieldName: string, errorName: string,
                  formGroupName?: string): string {

        if (parentForm && formGroupName === undefined) {
            const inputHasValidationErrors = this.hasErrors(parentForm, fieldName, errorName);

            return inputHasValidationErrors ? this.invalidClass : '';
        }

        const inputHasValidationErrors = this.hasErrors(parentForm, fieldName, errorName, formGroupName);

        return inputHasValidationErrors ? this.invalidClass : '';
    }
}
