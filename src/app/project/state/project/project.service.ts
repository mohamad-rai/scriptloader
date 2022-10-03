import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { arrayRemove, arrayUpsert, setLoading } from '@datorama/akita';
import { JComment } from '@trungk18/interface/comment';
import { JIssue } from '@trungk18/interface/issue';
import { KanbanPlugin, KanbanPluginMethod, KanbanPluginSchema } from '@trungk18/interface/kanban-plugin';
import { JProject } from '@trungk18/interface/project';
import { DateUtil } from '@trungk18/project/utils/date';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProjectStore } from './project.store';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  baseUrl: string;

  constructor(private _http: HttpClient, private _store: ProjectStore) {
    this.baseUrl = environment.apiUrl;
  }

  setLoading(isLoading: boolean) {
    this._store.setLoading(isLoading);
  }

  getProject() {
    this._http
      .get<JProject>(`${this.baseUrl}/project.json`)
      .pipe(
        setLoading(this._store),
        tap((project) => {
          this._store.update((state) => ({
              ...state,
              ...project
            }));
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }
  getProjectPlugins() {
    this._http
      .get<JProject>(`${this.baseUrl}/plugins.json`)
      .pipe(
        setLoading(this._store),
        tap((plugins) => {
          this._store.update(plugins);
        }),
        catchError((error) => {
          this._store.setError(error);
          return of(error);
        })
      )
      .subscribe();
  }

  savePluginMethods<T extends keyof KanbanPlugin>(methodName: T, method: KanbanPlugin[T]) {
    this._store.update((state) => {
      if (state.pluginMethods){
        if (state.pluginMethods[methodName])
          state.pluginMethods[methodName].push(method);
        else
          state.pluginMethods[methodName] = method;
        const i = state.pluginMethods[methodName];
      }
      else {
        const pluginMethods: KanbanPluginSchema = {};
        pluginMethods[methodName] = [method];
        return {
          ...state,
          pluginMethods
        }
      }
      console.log(state);
      return state;
    });
  }

  updateProject(project: Partial<JProject>) {
    this._store.update((state) => ({
      ...state,
      ...project
    }));
  }

  updateIssue(issue: JIssue) {
    issue.updatedAt = DateUtil.getNow();
    this._store.update((state) => {
      const issues = arrayUpsert(state.issues, issue.id, issue);
      return {
        ...state,
        issues
      };
    });
  }

  deleteIssue(issueId: string) {
    this._store.update((state) => {
      const issues = arrayRemove(state.issues, issueId);
      return {
        ...state,
        issues
      };
    });
  }

  updateIssueComment(issueId: string, comment: JComment) {
    const allIssues = this._store.getValue().issues;
    const issue = allIssues.find((x) => x.id === issueId);
    if (!issue) {
      return;
    }

    const comments = arrayUpsert(issue.comments ?? [], comment.id, comment);
    this.updateIssue({
      ...issue,
      comments
    });
  }
}
