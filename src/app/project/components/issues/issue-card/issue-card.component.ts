import {Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { JIssue } from '@trungk18/interface/issue';
import { IssuePriorityIcon } from '@trungk18/interface/issue-priority-icon';
import { KanbanPlugin } from '@trungk18/interface/kanban-plugin';
import { JUser } from '@trungk18/interface/user';
import { ProjectQuery } from '@trungk18/project/state/project/project.query';
import { IssueUtil } from '@trungk18/project/utils/issue';
import { ScriptService } from '@trungk18/services/script.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IssueModalComponent } from '../issue-modal/issue-modal.component';

const SCRIPT_PATH = '../../../../../assets/plugin.js';

declare let plg: KanbanPlugin;

@Component({
  selector: 'issue-card',
  templateUrl: './issue-card.component.html',
  styleUrls: ['./issue-card.component.scss']
})
@UntilDestroy()
export class IssueCardComponent implements OnChanges, OnInit {
  @Input() issue: JIssue;
  assignees: JUser[];
  issueTypeIcon: string;
  priorityIcon: IssuePriorityIcon;

  constructor(
    private _projectQuery: ProjectQuery,
    private _modalService: NzModalService,
    private renderer: Renderer2,
    private scriptService: ScriptService
  ) {}

  ngOnInit(): void {
    const scriptElement = this.scriptService.loadJsScript(this.renderer, SCRIPT_PATH);
    scriptElement.onload = () => {
      // console.log(this.issue.title);

      this.issue = plg.cards(this.issue);
    }
    scriptElement.onerror = (e: Event) => {
      console.log('error on loading js');
    }

    this._projectQuery.users$.pipe(untilDestroyed(this)).subscribe((users) => {
      this.assignees = this.issue.userIds.map((userId) => users.find((x) => x.id === userId));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const issueChange = changes.issue;
    if (issueChange?.currentValue !== issueChange.previousValue) {
      this.issueTypeIcon = IssueUtil.getIssueTypeIcon(this.issue.type);
      this.priorityIcon = IssueUtil.getIssuePriorityIcon(this.issue.priority);
    }
  }

  openIssueModal(issueId: string) {
    this._modalService.create({
      nzContent: IssueModalComponent,
      nzWidth: 1040,
      nzClosable: false,
      nzFooter: null,
      nzComponentParams: {
        issue$: this._projectQuery.issueById$(issueId)
      }
    });
  }
}
