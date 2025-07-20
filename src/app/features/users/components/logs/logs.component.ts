import {Component, OnInit} from '@angular/core';
import {TableModule} from "primeng/table";
import {Log} from '../../models/log';
import {LogService} from '../../services/log.service';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-logs',
    imports: [
        CommonModule,
        TableModule
    ],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss'
})
export class LogsComponent implements OnInit {

    logs!: Log[];

    constructor(private logService: LogService) {
    }

    ngOnInit() {
        this.loadData();
    }

    private loadData(): void {
        this.logService.getLogs().subscribe({
            next: (data) => {
                this.logs = data.map((x: Log) =>
                    Object.assign(new Log(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
