import { Routes } from "@angular/router";
import { ChatComponent } from "./chat.component";

export const ChatRoutes: Routes = [
    {
        path: "",
        component: ChatComponent,
        data: { title: "menu.messages", section: "menu.chat" },
    },
];
