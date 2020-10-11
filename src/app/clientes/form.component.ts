import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, pipe, throwError } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import swal from 'sweetalert2';
import { Region } from './region';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit, OnDestroy {
  public titulo = 'Alta / Modificación de Clientes';
  public cliente: Cliente = new Cliente();
  public regiones: Region[];
  private subscriptionParams$: Subscription = null;
  private observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  public erroresValidacion: string[];

  constructor(private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente();
    this.clienteService.getRegiones()
    .subscribe(regiones => this.regiones = regiones);
  }

  /* create
- Aquí en el controlador:
   No se captura el error (catchError), pero el error se puede manejar en el segundo parametro de la subscripción
En el servicio:
   no se captura error
*/
  public create(): void {
    this.observ$ = this.clienteService.create(this.cliente).pipe(
      takeUntil(this.unsubscribe$)
      /*      , catchError(err => {
               console.log('Se muestra el error y se vuelve a lanzar con throwError(err)', err);
               return throwError(err);
            }) */
    )
      .subscribe(
        json => {
          this.router.navigate(['/clientes']);
          swal.fire('Nuevo cliente', `${json.mensaje} - ${json.cliente.nombre}`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {
            this.router.navigate(['/clientes']);
            swal.fire('Error al crear cliente', err.error.error, 'error');
          }
        }
      );
  }

  /* cargarCliente getCliente
  - Aquí en el controlador:
     No se captura el error (catchError), pero el error se puede manejar en el segundo parametro de la subscripción
  En el servicio:
     se captura error y se relanza
  */
/*   cargarCliente(): void {
    this.subscriptionParams$ = this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(params => {
        const id: any = params.id;
        if (id) {
          this.observ$ = this.clienteService.getCliente(id)
            .pipe(
              takeUntil(this.unsubscribe$)
            )
            .subscribe(
              cliente => this.cliente = cliente,
              err => {
                this.router.navigate(['/clientes']);
                swal.fire('Error en consulta', err.error.mensaje, 'error');
              }
            );
        }
      });
  } */

  cargarCliente(): void {
    this.subscriptionParams$ = this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(params => this.getCliente(params));
  }

  getCliente(params: any) {
    const id: number = params.id;
    if (id) {
      this.observ$ = this.clienteService.getCliente(id)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          cliente => this.cliente = cliente,
          err => {
            this.router.navigate(['/clientes']);
            swal.fire('Error en consulta', err.error.mensaje, 'error');
          }
        );
    }
  }

  /* update
  - Aquí en el controlador:
     Se captura el error y se vuelve a lanzar, luego el error se gestiona en el segundo parametro de la subscripción
  En el servicio:
     no se captura error
  */
  update(): void {
    console.log(this.cliente);
    this.observ$ = this.clienteService.update(this.cliente).pipe(
      takeUntil(this.unsubscribe$),
      catchError(err => {
        console.log('Se captura el error con catchError(err) y se vuelve a lanzar con throwError(err)', err);
        return throwError(err);
      })
    )
      .subscribe(
        cliente => {
          this.router.navigate(['/clientes/page', 0]);
          swal.fire('Cliente ', `datos del cliente ${cliente.nombre} actualizados`, 'success');
        }
        , err => {
          if (err.status === 400) {
            this.erroresValidacion = err.error.errors as string[];
            console.log(this.erroresValidacion);
          } else {
            this.router.navigate(['/clientes']);
            swal.fire('Error al crear cliente', err.error.error, 'error');
          }
        }
      );
  }

  onButtonCancel(): void {
    this.router.navigate(['/clientes']);
  }

  ngOnDestroy(): void {
    console.log('FormComponent.ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    if (this.observ$ != null && !this.observ$.closed) {
      console.log('haciendo : this.observ$.unsubscribe()');
      this.observ$.unsubscribe();
    } else {
      console.log('No necesario hacer: this.observ$.unsubscribe()');
    }


    if (this.subscriptionParams$ != null && !this.subscriptionParams$.closed) {
      console.log('haciendo : this.subscriptionParams$.unsubscribe()');
      this.subscriptionParams$.unsubscribe();
    } else {
      console.log('No necesario hacer: this.subscriptionParams$.unsubscribe()');
    }
  }

  compareRegion(ob1: Region, ob2: Region): boolean {
    let resultado: boolean;
    if (ob1 === undefined && ob2 === undefined) {
      resultado = true;
    } else {
        resultado = (ob1 === null || ob2 === null || ob1 === undefined || ob2 === undefined)  ? false : ob1.id === ob2.id;
    }

/*  console.log('--------');
    console.log (`ob1=${JSON.stringify(ob1)}`);
    console.log (`ob2=${JSON.stringify(ob2)}`);
    console.log('-------->' + resultado); */

    return resultado;
  }

}
