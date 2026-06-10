# Biblioteca JS

Proyecto básico de biblioteca con frontend y backend.

## Características

- Registrar usuarios
- Borrar usuarios
- Registrar libros
- Borrar libros
- Registrar préstamos con:
  - Fecha de salida
  - Fecha propuesta de regreso
  - Fecha de entrega

## Arquitectura

- Backend: `Express` + `SQLite`
- Frontend: UI básica servida desde el mismo proyecto

## Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar la aplicación:
   ```bash
   npm start
   ```

3. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

## Archivos principales

- `server.js` - servidor Express y rutas API
- `db.js` - inicialización SQLite y tablas
- `public/index.html` - interfaz de usuario
- `public/app.js` - lógica de frontend
- `public/style.css` - estilos básicos
