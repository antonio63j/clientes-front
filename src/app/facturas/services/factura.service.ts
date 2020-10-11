import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura } from '../models/factura';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root'})

export class FacturaService {

  private httpEndPoint = 'http://localhost:8080/api/facturas';

  constructor(private router: Router,
    private http: HttpClient) {}

  public getFactura (id: number): Observable<Factura> {
     return this.http.get<Factura>(`${this.httpEndPoint}/${id}`);
  }

  public deleteFactura(id: number): Observable<void> {
    return this.http.delete<void> (`${this.httpEndPoint}/${id}`);
  }

  public crearFactura(factura: Factura): Observable<Factura> {
    return this.http.post<Factura> (`${this.httpEndPoint}`, factura);
  }

  public filtrarProductos(term: string): Observable <Producto[]> {
    return this.http.get<Producto[]> (`${this.httpEndPoint}/filtrar-productos/${term}`);
  }
}
