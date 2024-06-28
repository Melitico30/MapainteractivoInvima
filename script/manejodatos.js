// manejodatos.js
let datos;

fetch('ruta/datos.json')
.then(response => response.json())
.then(data => {
    datos = data;
    // Ahora puedes usar 'datos' para acceder a la información de las regiones
})
.catch(error => console.error('Error al cargar los datos:', error));
