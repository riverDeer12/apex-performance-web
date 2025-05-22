import {DynamicDialogConfig} from "primeng/dynamicdialog";

export const DialogFormConfig: DynamicDialogConfig = {
    autoZIndex: true,
    dismissableMask: true,
    closeOnEscape: true,
    modal: true,
    transitionOptions: '200ms',
    style: {
        'max-width': '90vh'
    },
    draggable: true,
    resizable: true
}
