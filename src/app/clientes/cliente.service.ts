import { Injectable } from '@angular/core';
import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable()
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';
  constructor(private http: HttpClient) { }

  /*  Opción 1
      getClientes(): Observable<Cliente[]> {
      //return of(CLIENTES);
      return this.http.get(this.urlEndPoint).pipe(
        map(response => response as Cliente[])
      );
    } */

  // Opción 2
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.urlEndPoint);
  }
}
