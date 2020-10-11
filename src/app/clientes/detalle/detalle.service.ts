import { Injectable, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from, of } from 'rxjs';
import { DetalleComponent} from './detalle.component';
import { catchError } from 'rxjs/operators';
import { Cliente } from '../cliente';

@Injectable({
  providedIn: 'root'
})
export class DetalleService {
  modal: any;

  constructor(private ngbModal: NgbModal) { }

  openModalScrollable(cliente: Cliente,
    prompt = 'Really?', title = 'Confirm'
  ): Observable<boolean> {
    this.modal = this.ngbModal.open(
      DetalleComponent,
      { size: 'lg', backdrop: 'static' });
    
    this.modal.componentInstance.cliente = cliente;
    this.modal.componentInstance.prompt = prompt;
    this.modal.componentInstance.title = title;

    return from(this.modal.result).pipe(
      catchError(error => {
        console.warn(error);
        return of(undefined);
      })
    );
  }

  closeModalScrollable() {
    this.modal.close();
  }

}
