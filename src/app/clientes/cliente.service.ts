import { Injectable, OnDestroy } from '@angular/core';
// import { CLIENTES } from './clientes.json';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Region } from './region';
import { Cliente } from './cliente';
import { AuthService } from '../usuarios/auth.service';

@Injectable()
export class ClienteService implements OnDestroy {
  private urlEndPoint = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient,
    public authService: AuthService) { }

/*   private agregarAuthorizationHeader () {
    const token = this.authService.token;
    if (token != null) {
      return this.httpHeader.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeader;
  } */

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  /*  Opción 1
      getClientes(): Observable<Cliente[]> {
      //return of(CLIENTES);
      return this.http.get(this.urlEndPoint).pipe(
        map(response => response as Cliente[])
      );
    } */

  // Opción 2
  getClientes(page: number): Observable<any> {
    return this.http.get<Cliente[]>(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        /*            (response.content as Cliente[]).forEach (cliente => console.log(cliente)); */
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.apellido = cliente.apellido.toUpperCase();
          return cliente;
        });
        return response;
      }),
      tap((response: any) => {
        /*           (response.content as Cliente[]).forEach (cliente => console.log(cliente)); */
      })
    );
  }

  create(cliente: Cliente): Observable<any> {
    /* se añade el token con TokenInterceptor
    return this.http.post<any>(this.urlEndPoint, cliente, { headers: this.httpHeader }); */
     return this.http.post<Cliente>(this.urlEndPoint, cliente).pipe(
          catchError(err => {
            console.log(`error capturado en create: ${err.error.error} `);
            return throwError (err);
          })
      );
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(err => {
        console.log(`error capturado y relanzado en getCliente y: ${err.message} `);
        return throwError(err);
      })
    );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      catchError(err => {
        console.log(`error al actualizar datos del cliente: ${err.message} `);
        return throwError(err);
      })
      , map((response: any) => response.cliente as Cliente)
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(err => {
        console.error(`error al eliminar cliente: ${err.status} `);
        console.error(`error al eliminar cliente: ${err.message} `);
        return throwError(err);
      }));
  }

  subirFoto(archivo: File, id: number): Observable<HttpEvent<{}>> {

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id.toString());

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      catchError(err => {
        console.error(`error al subir foto: ${err.message} `);
        return throwError(err);
      }));
  }

  ngOnDestroy() {
    console.log('ClienteService.ngOnDestroy ()');
  }

}
