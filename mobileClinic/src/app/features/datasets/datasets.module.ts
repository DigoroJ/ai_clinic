import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatasetUploadComponent } from './dataset-upload/dataset-upload.component';
import { DatasetListComponent } from './dataset-list/dataset-list.component';
import { DataQualityComponent } from './data-quality/data-quality.component';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';



@NgModule({
  declarations: [
    DatasetUploadComponent,
    DatasetListComponent,
    DataQualityComponent,
    DataAnalysisComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DatasetsModule { }
