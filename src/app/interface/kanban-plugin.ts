import { JIssue } from "./issue";

export interface KanbanPlugin {
    alert(): void,
    cards(issue: JIssue): JIssue
}