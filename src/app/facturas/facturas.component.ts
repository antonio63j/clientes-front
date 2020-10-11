import { Component, OnInit, OnDestroy } from '@angular/core';
import { Factura } from './models/factura';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService } from '../clientes/cliente.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map, flatMap } from 'rxjs/operators';
import swal from 'sweetalert2';
import { FormControl } from '@angular/forms';
import { FacturaService } from './services/factura.service';
import { Producto } from './models/producto';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ItemFactura } from './models/item-factura';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html'
})
export class FacturasComponent implements OnInit, OnDestroy {

  titulo = 'Nueva factura';
  factura: Factura = new Factura();
  observ$: Subscription = null;
  private unsubscribe$ = new Subject();
  private subscriptionParams$: Subscription = null;

  public autoCompleteControl = new FormControl();
  public productosFiltrados: Observable<Producto[]>;


  constructor(private clienteService: ClienteService,
    private facturaService: FacturaService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.subscripcionParam();
    this.productosFiltrados = this.autoCompleteControl.valueChanges
    .pipe(
      map(value => typeof (value) === 'string' ? value : value.nombre),
      // si no existe value se devuelve arreglo vacio
      flatMap (value => value ? this._filter(value) : [])
    );
  }

  subscripcionParam() {
    this.subscriptionParams$ = this.activatedRoute.params
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(params => this.subscripcionCliente(params));
  }

  subscripcionCliente(params: any) {
    const clienteId = params.clienteId; // o +params.get('page');

    this.observ$ = this.clienteService.getCliente(clienteId).pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(
      cliente => {
         this.factura.cliente = cliente;
      }
      , err => {
        swal.fire('Error carga de clientes ', 'error grave', 'error');
      }
    );
  }

  private _filter(value: string): Observable<Producto[]> {
    const filterValue = value.toLowerCase();
    return this.facturaService.filtrarProductos(filterValue);
  }

  // producto puede venir o no
  mostrarNombre (producto ?: Producto ): string | undefined {
    return producto ? producto.nombre : undefined;
  }

  productoSeleccionado(event: MatAutocompleteSelectedEvent): void {
    const producto: Producto = event.option.value as Producto;

    if (this.existeItemFactura(producto.id)) {
       this.incrementaCantidad(producto.id);
    } else {
      const  itemFactura: ItemFactura = new ItemFactura();
      itemFactura.producto = producto;
      this.factura.itemsFactura.push(itemFactura);
    }
    this.autoCompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();

  }

  actualizarCantidad(itemFactura: ItemFactura, event: any): void {
    const cantidad: number = event.target.value as number;

    if (cantidad == 0) {
      this.eliminarItemFactura(itemFactura);
      return;
    }

    this.factura.itemsFactura = this.factura.itemsFactura.map((item: ItemFactura) => {
      if (itemFactura.producto.id === item.producto.id) {
        item.cantidad = cantidad;
      }
      return item;
    });
  }

  existeItemFactura(id: number): boolean {
    let existe = false;
    this.factura.itemsFactura.forEach((item: ItemFactura) =>{
       if (item.producto.id === id) {
         existe = true;
       }
    });
    return existe;
  }

  incrementaCantidad(id: number): void {
    this.factura.itemsFactura.forEach((item: ItemFactura) => {
      if (item.producto.id === id) {
        item.cantidad = item.cantidad + 1;
      }
   });
  }

  eliminarItemFactura (itemFactura: ItemFactura): void {
    this.factura.itemsFactura = this.factura.itemsFactura.filter((item: ItemFactura) =>
      itemFactura.producto.id !== item.producto.id);
  }

  crearFactura(): void {
    this.facturaService.crearFactura(this.factura).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      factura => {
        swal.fire('Factura creada con éxito ', factura.descripcion, 'success');
        this.router.navigate(['/facturas', factura.id]);
      }
      , err => {
        swal.fire('Error al crear facutra ', 'error grave', 'error');
      })
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy (), realizando unsubscribes');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
