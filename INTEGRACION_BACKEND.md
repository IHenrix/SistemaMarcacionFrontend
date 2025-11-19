# 🔌 Integración Frontend-Backend Completada

## ✅ Archivos Creados/Modificados

### 📁 Nuevos Archivos

#### Modelos
- ✅ `src/app/models/auth.model.ts` - Interfaces TypeScript para autenticación y usuario

#### Servicios
- ✅ `src/app/services/auth.service.ts` - Servicio de autenticación con JWT
- ✅ `src/app/services/usuario.service.ts` - Servicio para operaciones de usuario

#### Guards
- ✅ `src/app/guards/auth.guard.ts` - Guard de autenticación y admin

#### Interceptors
- ✅ `src/app/interceptors/auth.interceptor.ts` - Interceptor HTTP para JWT

### 📝 Archivos Modificados

- ✅ `src/app/app.config.ts` - Configurado interceptor
- ✅ `src/app/app.routes.ts` - Habilitado authGuard
- ✅ `src/environments/environment.ts` - URL del backend actualizada
- ✅ `src/app/components/login/login.ts` - Integrado con AuthService
- ✅ `src/app/components/layout/sidebar/sidebar.ts` - Datos dinámicos del usuario
- ✅ `src/app/components/layout/sidebar/sidebar.html` - Binding de datos

---

## 🔐 Características Implementadas

### 1. Sistema de Autenticación Completo

#### AuthService
```typescript
// Login
this.authService.login(username, password).subscribe(...)

// Logout
this.authService.logout()

// Verificar autenticación
this.authService.isAuthenticated() // boolean

// Obtener usuario actual
this.authService.getCurrentUser() // Usuario | null

// Verificar rol
this.authService.hasRole('ADMINISTRADOR') // boolean
this.authService.isAdmin() // boolean

// Observable del usuario
this.authService.currentUser$ // Observable<Usuario | null>
```

#### Flujo de Login
1. Usuario ingresa credenciales en el formulario
2. Se llama a `authService.login()`
3. Request HTTP al backend: `POST /api/auth/login.php`
4. Backend valida y retorna token JWT + datos de usuario
5. Token y usuario se guardan en `localStorage`
6. Usuario se actualiza en el `BehaviorSubject`
7. Redirige a `/sistema/menu-principal`
8. Mensaje de bienvenida con SweetAlert2

#### Flujo de Logout
1. Usuario hace clic en "Salir" en el Sidebar
2. Confirma con SweetAlert2
3. Se llama a `authService.logout()`
4. Se limpia `localStorage` (token y usuario)
5. Se actualiza el `BehaviorSubject` a null
6. Redirige a `/login`

---

### 2. Protección de Rutas

#### authGuard
- Protege todas las rutas bajo `/sistema`
- Verifica si el usuario está autenticado
- Redirige al login si no hay sesión
- Muestra mensaje con SweetAlert2

#### adminGuard
- Verifica rol de ADMINISTRADOR
- Útil para proteger secciones administrativas

```typescript
// Uso en rutas
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}
```

---

### 3. Interceptor HTTP Automático

El interceptor `authInterceptor` automáticamente:

- ✅ Añade el header `Authorization: Bearer <token>` a todas las peticiones HTTP
- ✅ Maneja errores 401 (sesión expirada) → logout automático
- ✅ Maneja errores 403 (sin permisos) → muestra mensaje
- ✅ Maneja errores 500 (error del servidor) → muestra mensaje

**No necesitas agregar manualmente el token en cada request!**

```typescript
// Antes (sin interceptor):
this.http.get(url, {
  headers: { Authorization: `Bearer ${token}` }
})

// Ahora (con interceptor):
this.http.get(url) // El token se agrega automáticamente
```

---

### 4. Sidebar con Datos Dinámicos

El Sidebar ahora muestra los datos reales del usuario autenticado:

- **Nombre completo**: Del response del login
- **Área**: Obtenida de la BD
- **Perfil/Rol**: ADMINISTRADOR u OPERATIVO
- **Teléfono**: Del usuario
- **Email**: Del usuario

Los datos se actualizan reactivamente gracias al `BehaviorSubject`.

---

### 5. Gestión de Estado del Usuario

El usuario actual se mantiene en:
1. **localStorage**: Persistencia entre recargas
2. **BehaviorSubject**: Estado reactivo en toda la app

Cualquier componente puede suscribirse:

```typescript
this.authService.currentUser$.subscribe(usuario => {
  console.log('Usuario actual:', usuario);
});
```

---

## 🚀 Cómo Probar la Integración

### 1. Verificar que el backend esté corriendo
```bash
# XAMPP debe estar corriendo:
# - Apache: Running
# - MySQL: Running
```

### 2. Iniciar el frontend Angular
```bash
cd SistemaMarcacionFrontend
ng serve
```

### 3. Abrir en navegador
```
http://localhost:4200
```

### 4. Probar el Login

**Usuario de prueba:**
- Username: `70000001`
- Password: `password`

**Flujo esperado:**
1. Ingresa credenciales → Clic en "Iniciar sesión"
2. Se hace la petición al backend PHP
3. Backend retorna token JWT y datos del usuario
4. Mensaje de bienvenida: "¡Bienvenido! Hola Ricardo Enrique Prada Guerra"
5. Redirige a `/sistema/menu-principal`
6. El Sidebar muestra los datos del usuario

### 5. Verificar el Token

**Abrir DevTools → Application → Local Storage:**
```
token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
usuario: {"id":1,"dni":"70000001","nombre":"Ricardo..."}
```

### 6. Probar Rutas Protegidas

1. Sin login → Intenta acceder a `/sistema/menu-principal`
   - **Resultado**: Redirige al login con mensaje

2. Con login → Accede a `/sistema/menu-principal`
   - **Resultado**: Acceso permitido

### 7. Probar Logout

1. Clic en el botón "Salir" del Sidebar
2. Confirma en el diálogo
3. Se limpia localStorage
4. Redirige a `/login`

---

## 🔍 Verificar Integración en DevTools

### Network Tab (Peticiones HTTP)

#### Login Request:
```
POST http://localhost/proyectoWeb/SistemaMarcacionBackend/api/auth/login.php

Request Payload:
{
  "username": "70000001",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 86400,
    "usuario": {
      "id": 1,
      "dni": "70000001",
      "nombre": "Ricardo Enrique Prada Guerra",
      ...
    }
  },
  "message": "Login exitoso"
}
```

#### Peticiones posteriores con token:
```
GET http://localhost/proyectoWeb/SistemaMarcacionBackend/api/usuario/perfil.php

Headers:
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 📦 Servicios Disponibles

### AuthService

```typescript
import { AuthService } from '@app/services/auth.service';

constructor(private authService: AuthService) {}

// Login
this.authService.login('70000001', 'password').subscribe(response => {
  console.log('Token:', response.data.token);
});

// Logout
this.authService.logout();

// Verificaciones
const isAuth = this.authService.isAuthenticated();
const isAdmin = this.authService.isAdmin();
const user = this.authService.getCurrentUser();

// Observable
this.authService.currentUser$.subscribe(usuario => {
  console.log('Usuario:', usuario);
});
```

### UsuarioService

```typescript
import { UsuarioService } from '@app/services/usuario.service';

constructor(private usuarioService: UsuarioService) {}

// Obtener perfil (requiere estar autenticado)
this.usuarioService.obtenerPerfil().subscribe(response => {
  console.log('Perfil:', response.data);
});

// Registrar nuevo usuario
this.usuarioService.registrarUsuario({
  dni: '70000020',
  nombres: 'Juan',
  apellidos: 'Pérez',
  username: '70000020',
  password: 'juan123',
  roles: [2]
}).subscribe(response => {
  console.log('Usuario creado:', response.data);
});
```

---

## 🛡️ Seguridad Implementada

### 1. Token JWT
- Almacenado en localStorage
- Expiración de 24 horas
- Validación de firma en el backend
- Decodificación del payload para verificar expiración

### 2. Guards de Ruta
- Previenen acceso no autorizado
- Redirigen al login automáticamente
- Verifican roles si es necesario

### 3. Interceptor HTTP
- Añade token automáticamente
- Maneja errores de autenticación
- Cierra sesión si el token expira

### 4. Validaciones
- Formulario de login con Validators
- Trim de espacios en username
- Mensajes claros de error

---

## 🐛 Troubleshooting

### Error: "CORS policy"
**Solución**: Verifica que el backend esté corriendo y que `includes/cors.php` esté configurado correctamente con `http://localhost:4200`

### Error: "Token no proporcionado"
**Solución**: Verifica que el login fue exitoso y que el token se guardó en localStorage

### Error: "Connection refused"
**Solución**: Verifica que Apache esté corriendo en XAMPP

### El Sidebar no muestra datos
**Solución**: Verifica que el usuario esté en el observable. Abre DevTools → Console:
```typescript
// En el componente
console.log('Usuario:', this.usuario);
```

### El guard no funciona
**Solución**: Verifica que `authGuard` esté importado y aplicado en `app.routes.ts`

---

## ✅ Checklist de Verificación

- [ ] Backend PHP corriendo en XAMPP
- [ ] Base de datos `sistema_marcaciones` creada
- [ ] Frontend Angular corriendo (`ng serve`)
- [ ] Login funciona y guarda token en localStorage
- [ ] Sidebar muestra datos del usuario autenticado
- [ ] Logout limpia localStorage y redirige al login
- [ ] Rutas protegidas redirigen al login si no hay sesión
- [ ] Token se añade automáticamente a las peticiones HTTP

---

## 📚 Próximos Pasos

1. ✅ Login integrado
2. ✅ Guards habilitados
3. ✅ Interceptor configurado
4. ✅ Sidebar con datos dinámicos
5. 📝 Integrar módulo de Marcaciones con backend
6. 📝 Integrar módulo de Reportes con backend
7. 📝 Integrar módulo de Contacto con backend

---

**¡Integración completada exitosamente!** 🎉

El frontend Angular ya está completamente conectado con el backend PHP.
