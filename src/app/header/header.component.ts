import { Component } from '@angular/core';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
 title = 'App Angular';
 public isMenuCollapsed = true;

 constructor (public authService: AuthService) {

 }

 logout (): void {
   this.authService.logout();
 }
}
