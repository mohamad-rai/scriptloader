import { JIssue } from './issue';

export interface KanbanPlugin {
  issueAssignees?: () => boolean;
  issueCard?: (issue: JIssue) => JIssue;
  issueComments?: () => boolean;
  issueDeleteModal?: () => boolean;
}

export interface KanbanPluginArray {
  issueAssignees?: (() => boolean)[];
  issueCard?: ((issue: JIssue) => JIssue)[];
  issueComments?: (() => boolean)[];
  issueDeleteModal?: (() => boolean)[];
}
export type KanbanPluginMethod<T extends keyof KanbanPlugin> = KanbanPlugin[T];

// export type KanbanPluginSchema = {[K in keyof KanbanPlugin]: KanbanPlugin[K][]};

export interface PluginDetail {
  token: string;
  name: string;
  scope: (keyof KanbanPlugin)[];
  path: string;
}
