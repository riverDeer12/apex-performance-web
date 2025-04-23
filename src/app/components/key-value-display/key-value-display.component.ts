import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-key-value-display',
    imports: [CommonModule],
    standalone: true,
    templateUrl: './key-value-display.component.html',
    styleUrl: './key-value-display.component.scss'
})
export class KeyValueDisplayComponent {
    @Input() data: any;

    isObject(value: any): boolean {
        return typeof value === 'object' && value !== null;
    }

    getEntries(obj: any): [string, any][] {
        return Object.entries(obj);
    }
}
