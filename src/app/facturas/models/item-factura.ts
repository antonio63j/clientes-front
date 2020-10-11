import { Producto } from './producto';

export class ItemFactura {
    // id: number;
    producto: Producto;
    cantidad  = 1 ;
    importe: number;

    public calcularImporte(): number  {
        return this.cantidad * this.producto.precio;
    }
}
