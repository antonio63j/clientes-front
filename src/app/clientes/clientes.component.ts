import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { ModalService } from './detalle/modal.service';
import { DetalleService } from './detalle/detalle.service';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { takeUntil, map, tap, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import localeES from '@angular/common/locales/es';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import swal from 'sweetalert2';
import { PaginatorComponent } from '../paginator/paginator.component';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})

export class ClientesComponent implements OnInit, OnDestroy {

  clientes: Cliente[];
  observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  public paginador: any;
  private subscriptionParams$: Subscription = null;
  private subscriptionEvents$: Subscription = null;
  private page: number;
  clienteSeleccionado: Cliente;

  constructor(private clienteService: ClienteService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private detalleService: DetalleService,
    public modalService: ModalService,
    public authService: AuthService) { }

  ngOnInit() {
    this.subscripcionCambioPagina();
    this.subscripcioneventoNotificacionUpload();
    this.subscripcioneventoCerrarModalScrollable();
  }

  subscripcioneventoNotificacionUpload(): void {
    this.subscriptionEvents$ = this.modalService.eventoNotificacionUpload.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(
        cliente => {
          this.clientes.map(clienteOriginal => {
               if (clienteOriginal.id === cliente.id) {
                 clienteOriginal.foto = cliente.foto;
               }
               return clienteOriginal;
          }); // map
        }
      );
  }

  subscripcioneventoCerrarModalScrollable() {
    this.modalService.eventoCerrarModalScrollable.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(
        () => {
          this.detalleService.closeModalScrollable();
        }
      );
  }

  subscripcionCambioPagina() {
    this.subscriptionParams$ = this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(params => this.nuevaPagina(params));
  }

  nuevaPagina(params: any) {
    this.page = params.page; // o +params.get('page');
    if (!this.page) {
      this.page = 0;
    }
    this.observ$ = this.clienteService.getClientes(this.page).pipe(
      takeUntil(this.unsubscribe$),
      tap((response: any) => {
         console.log(response);
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          return cliente;
        });
        return response;
      }),
    ).subscribe(
      response => {
        this.clientes = (response.content as Cliente[]);
        this.paginador = response;
      }
      , err => {
        swal.fire('Error carga de clientes ', 'error grave', 'error');
      }
    );
  }

  setClienteSeleccionado(cliente: Cliente): void {
     this.clienteSeleccionado = cliente;
     // this.modalService.abrirModal();
     this.abrirModalScrollable();
  }

  abrirModalScrollable() {

    this.detalleService.openModalScrollable(this.clienteSeleccionado, '',
      'Detalle cliente y facturas'
    ).pipe(
      take(1) // take() manages unsubscription for us
    ).subscribe(result => {
      console.log({ confirmedResult: result });
      // this.confirmedResult = result;
    });
  }



  /* delete
  - Aquí en el controlador:
     No se captura el error (catchError), pero el error se puede manejar en el segundo parametro de la subscripción
  En el servicio:
     no se captura error
  */
  delete(cliente: Cliente): void {
    swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el cliente ${cliente.nombre}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.clienteService.delete(cliente.id).subscribe(
          response => {
            if (this.paginador.numberOfElements === 1) {
              this.page = 0;
            }
            this.clienteService.getClientes(this.page).subscribe(respon => {
              this.clientes = respon.content as Cliente[];
              this.paginador = respon;
            });
            swalWithBootstrapButtons.fire(
              `Eliminado el cliente ${cliente.nombre}!`,
              'uno menos',
              'success'
            );
          }
          , err => {
            swal.fire('Error al eliminar cliente', err.error.error, 'error');
          }
        );
      }
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false
});
