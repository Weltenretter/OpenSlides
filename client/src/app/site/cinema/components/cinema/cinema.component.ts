import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ProjectorService } from 'app/core/core-services/projector.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { DetailNavigable, isDetailNavigable } from 'app/shared/models/base/detail-navigable';
import { ProjectorElement } from 'app/shared/models/core/projector';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewComponentDirective } from 'app/site/base/base-view';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { CurrentListOfSpeakersService } from 'app/site/projector/services/current-list-of-speakers.service';

@Component({
    selector: 'os-cinema',
    templateUrl: './cinema.component.html',
    styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent extends BaseViewComponentDirective implements OnInit {
    public listOfSpeakers: ViewListOfSpeakers;
    public projector: ViewProjector;
    private currentProjectorElement: ProjectorElement;
    public projectedViewModel: BaseProjectableViewModel;

    /**
     * filled by child component
     */
    public canReaddLastSpeaker: boolean;

    public get title(): string {
        if (this.projectedViewModel) {
            return this.projectedViewModel.getListTitle();
        } else if (this.currentProjectorElement) {
            return this.projectorService.getSlideTitle(this.currentProjectorElement)?.title;
        } else {
            return '';
        }
    }

    public get projectorTitle(): string {
        return this.projector?.getTitle() || '';
    }

    public get closUrl(): string {
        if (this.listOfSpeakers && this.operator.hasPerms(this.permission.agendaCanManageListOfSpeakers)) {
            return this.listOfSpeakers?.listOfSpeakersUrl;
        } else {
            return '';
        }
    }

    public get isLosClosed(): boolean {
        return this.listOfSpeakers?.closed;
    }

    public get viewModelUrl(): string {
        if (this.projectedViewModel && isDetailNavigable(this.projectedViewModel)) {
            return (this.projectedViewModel as DetailNavigable).getDetailStateURL();
        } else {
            return '';
        }
    }

    public get projectorUrl(): string {
        if (this.projector) {
            if (this.operator.hasPerms(this.permission.coreCanManageProjector)) {
                return `/projectors/detail/${this.projector.id}`;
            } else {
                return `/projector/${this.projector.id}`;
            }
        } else {
            return '';
        }
    }

    public get projectionTarget(): '_blank' | '_self' {
        if (this.operator.hasPerms(this.permission.coreCanManageProjector)) {
            return '_self';
        } else {
            return '_blank';
        }
    }

    public constructor(
        title: Title,
        translate: TranslateService,
        snackBar: MatSnackBar,
        private operator: OperatorService,
        private projectorService: ProjectorService,
        projectorRepo: ProjectorRepositoryService,
        closService: CurrentListOfSpeakersService,
        private listOfSpeakersRepo: ListOfSpeakersRepositoryService
    ) {
        super(title, translate, snackBar);

        this.subscriptions.push(
            projectorRepo.getReferenceProjectorObservable().subscribe(refProjector => {
                this.projector = refProjector;
                this.currentProjectorElement = refProjector?.firstUnstableElement || null;
                if (this.currentProjectorElement) {
                    this.projectedViewModel = this.projectorService.getViewModelFromProjectorElement(
                        this.currentProjectorElement
                    );
                } else {
                    this.projectedViewModel = null;
                }
            }),
            closService.currentListOfSpeakersObservable.subscribe(clos => {
                this.listOfSpeakers = clos;
            })
        );
    }

    public ngOnInit(): void {
        super.setTitle('Autopilot');
    }

    public async toggleListOfSpeakersOpen(): Promise<void> {
        await this.listOfSpeakersRepo.setListOpenness(this.listOfSpeakers, this.isLosClosed).catch(this.raiseError);
    }

    public async readdLastSpeaker(): Promise<void> {
        await this.listOfSpeakersRepo.readdLastSpeaker(this.listOfSpeakers).catch(this.raiseError);
    }
}
