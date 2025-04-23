import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Deerlicious by
        <a href="https://rdd.software" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">RDD</a>
    </div>`
})
export class AppFooter {}
