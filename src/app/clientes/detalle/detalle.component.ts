import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Subject, throwError } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../usuarios/auth.service';
import { Factura } from '../../facturas/models/factura';
import { FacturaService } from '../..//facturas/services/factura.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})

export class DetalleComponent implements OnInit, OnDestroy {
  title: string;
  prompt: string;

  nombreArchivoFoto: File;
  private nombreFicheroFotoEnHost: string;
  progreso: number;
 // @Input() cliente: Cliente;
  cliente: Cliente;

  private observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  private subscriptionParams$: Subscription = null;

  constructor(private clienteService: ClienteService,
    private facturaService: FacturaService,
    public modalService: ModalService,
    public authService: AuthService,
    public activeModal: NgbActiveModal,
    private router: Router
    ) { }

  ngOnInit() {

  }

  selecionarFoto(event) {
    this.nombreArchivoFoto = event.target.files[0];
    this.progreso = 0;

    if (this.nombreArchivoFoto.type.indexOf('image') < 0 ) {
       swal.fire('Error en selección de la foto', 'el archivo debe ser una imagen', 'error');
       this.nombreArchivoFoto = null;
    }
  }

  subirFoto() {
    if (this.nombreArchivoFoto) {
      this.clienteService.subirFoto(this.nombreArchivoFoto, this.cliente.id)
        .pipe(
          takeUntil(this.unsubscribe$),
          tap((response: any) => {
            console.log(response);
          }),
        )
        .subscribe(
          event => {
            switch (event.type) {
              case HttpEventType.Sent:
                console.log (`Recibido evento HttpEventType.Sent.`);
                break;
              case HttpEventType.UploadProgress:
                this.progreso = Math.round(100 * event.loaded / event.total);
                break;
              case HttpEventType.Response:  // fichero subido complentamente
                const response: any = event.body;
                this.cliente = response.cliente as Cliente;
                this.modalService.eventoNotificacionUpload.emit(this.cliente);
                swal.fire('La foto se ha subido con éxito', response.mensaje, 'success');
                break;
              default:
                console.log (`surprising upload event: ${event.type}.`);
                break;
            }

          },
          err => {
            //  swal solo mustra el último aviso, por tanto no vemos el swal que se ha puesto en AuthInterceptor
            swal.fire(`status  ${err.status}`, err.error.error, 'error');
            console.error(err);
          }
        );
    } else {
      swal.fire('Error', 'debe seleccionar una foto', 'error');
      }
  }

  crearFactura(idCliente: number) {
    this.router.navigate(['/facturas/form', idCliente]);
    this.modalService.eventoCerrarModalScrollable.emit();
  }

    verFactura(idFactura: number) {
        this.router.navigate(['/facturas', idFactura]);
        this.modalService.eventoCerrarModalScrollable.emit();
  }

  deleteFactura(factura: Factura): void {
    swalWithBootstrapButtons.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás la factura: ${factura.descripcion}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.facturaService.deleteFactura(factura.id).subscribe(
          () => { // puestos que deleteFactura devuelve void
            this.cliente.facturas = this.cliente.facturas.filter(f => f !== factura);
            swalWithBootstrapButtons.fire(
              `Eliminada factura ${factura.descripcion}!`,
              'una menos',
              'success'
            );
          }
          , err => {
            swal.fire('Error al eliminar factura', err.error.error, 'error');
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
