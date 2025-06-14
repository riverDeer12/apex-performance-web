import {Component, Input} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";

@Component({
    selector: 'app-key-value-display',
    imports: [CommonModule],
    standalone: true,
    providers: [DatePipe],
    templateUrl: './key-value-display.component.html',
    styleUrl: './key-value-display.component.scss'
})
export class KeyValueDisplayComponent {
    @Input() data: any;

    constructor(private datePipe: DatePipe) {
    }

    isObject(value: any): boolean {
        return typeof value === 'object' && value !== null;
    }

    getEntries(obj: any): [string, any][] {
        return Object.entries(obj);
    }

    showLabel(entryElement: string) {
        return entryElement
            .replace(/[_\- ]+/g, ' ')
            .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (_, char) => char.toUpperCase())
            .replace(/\s+/g, '');
    }

    showValue(entryElement: any) {
        const date = new Date(entryElement);

        if (!isNaN(date.getTime()) && !(typeof entryElement === 'boolean')) {
            return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm');
        } else {
            return entryElement;
        }
    }
}
