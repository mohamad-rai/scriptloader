import { Component, OnInit, Renderer2 } from '@angular/core';
import { ProjectService } from './state/project/project.service';
import { AuthService } from './auth/auth.service';
import { LoginPayload } from '@trungk18/project/auth/loginPayload';
import { ScriptService } from '@trungk18/services/script.service';
import { KanbanPlugin, PluginDetail } from '@trungk18/interface/kanban-plugin';
import { ProjectQuery } from './state/project/project.query';
import { delay, map } from 'rxjs/operators';

declare let anObjectDefinedInPluginJSFile: KanbanPlugin;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  expanded: boolean;
  constructor(
    private _projectService: ProjectService,
    private _projectQuery: ProjectQuery,
    private _authService: AuthService,
    private renderer: Renderer2,
    private scriptService: ScriptService,
  ) {
    this.expanded = true;
  }

  ngOnInit(): void {
    this._authService.login(new LoginPayload());
    this._projectService.getProject();
    this._projectService.getProjectPlugins();
    this.handleResize();

    
    this._projectQuery.plugins$.subscribe((plugins) => {
      if (!plugins || !plugins.length) return;
      const allPlugins: {[k: string]: any} = {};
      for (let plugin of plugins) {
        if (!plugin.token || !this.APIValidation(plugin.token)) continue;
        const scriptElement = this.scriptService.loadJsScript(this.renderer, plugin.path);
        
        scriptElement.onload = () => {
          for (let scope of plugin.scope) {
            if(anObjectDefinedInPluginJSFile[scope])
              this._projectService.savePluginMethods(scope, anObjectDefinedInPluginJSFile[scope]);
          }
        }
      }
    });
  }

  private APIValidation(token: string): boolean {
    if (token) return true;
    return false;
  }

  handleResize() {
    const match = window.matchMedia('(min-width: 1024px)');
    match.addEventListener('change', (e) => {
      console.log(e);
      this.expanded = e.matches;
    });
  }

  manualToggle() {
    this.expanded = !this.expanded;
  }
}
