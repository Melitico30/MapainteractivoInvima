window.onload = function() {
    let datos;
    let regionSeleccionada = null; // Variable para almacenar la región actualmente seleccionada
    const defaultTitle = "Seleccione una región para ver las líneas de atención"; // Título por defecto

    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            datos = data;

            const areas = document.querySelectorAll('svg path');
            const mapContainer = document.getElementById('map-container');
            const infoContactContainer = document.getElementById('info-contact-container');
            const dynamicTitle = document.getElementById('dynamic-title');

            const handleClick = function(event) {
                event.stopPropagation();
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);

                if (regionGroup === regionSeleccionada) {
                    // Si la región actualmente seleccionada es la misma que la que se hizo clic, deseleccionar
                    regionSeleccionada = null;
                    hideInfoContainers();
                    resetColors(); // Función para restablecer los colores a los valores originales
                    animateMapAndInfo(false); // Animación para desplazar el mapa y la información hacia arriba
                    dynamicTitle.innerText = defaultTitle; // Restaurar el título por defecto
                } else {
                    // Si se hace clic en una región diferente o ninguna está seleccionada
                    regionSeleccionada = regionGroup;
                    showRegionInfo(regionGroup); // Función para mostrar la información de la región seleccionada
                    resetColors(); // Restablecer los colores a los valores originales antes de resaltar la nueva región
                    highlightRegionGroup(regionGroup); // Función para resaltar visualmente la región seleccionada
                    animateMapAndInfo(true); // Animación para desplazar el mapa y la información hacia abajo
                    dynamicTitle.innerText = regionGroup; // Cambiar el título a la región seleccionada
                }
            };

            const handleMouseOver = function() {
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);
                if (regionGroup !== regionSeleccionada) {
                    this.setAttribute('fill', '#abcd73');
                }
            };

            const handleMouseOut = function() {
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);
                if (regionGroup !== regionSeleccionada) {
                    this.setAttribute('fill', '#139EC8');
                }
            };

            const resetColors = function() {
                areas.forEach(area => {
                    area.setAttribute('fill', '#139EC8');
                });
            };

            const highlightRegionGroup = function(group) {
                for (const id in datos[group]) {
                    document.getElementById(id).setAttribute('fill', '#abcd73');
                }
            };

            const showRegionInfo = function(group) {
                const regionData = datos[group];

                // Mostrar información del primer elemento del grupo ya que todos tienen la misma estructura
                const firstRegionData = regionData[Object.keys(regionData)[0]];

                if (firstRegionData) {
                    document.getElementById('info-container').innerHTML = `
                        <div class="titulo-container">
                            <h3>CIUDAD SEDE</h3>
                            <p><strong>${firstRegionData.ciudadSede ? firstRegionData.ciudadSede.split(',,')[0] : 'No disponible'}</strong></p>
                            <p>${firstRegionData.direccion ? firstRegionData.direccion : 'No disponible'}</p>
                        </div>
                        <div class="contenedor">
                            ${firstRegionData.municipios && firstRegionData.municipios.length > 0 ? `
                                <div class="municipios">
                                    <h4>Municipios</h4>
                                    <ul>${firstRegionData.municipios.map(municipio => {
                                        if (municipio.endsWith(':')) {
                                            return `<li class="region-name"><span class="icono">▶</span>${municipio}</li>`;
                                        } else {
                                            return `<li>${municipio}</li>`;
                                        }
                                    }).join('')}</ul>
                                </div>` : ''}
                            ${firstRegionData.departamentos && firstRegionData.departamentos.length > 0 ? `
                                <div class="departamentos">
                                    <h4>Departamentos</h4>
                                    <ul>${firstRegionData.departamentos.map(departamento => `<li>${departamento}</li>`).join('')}</ul>
                                </div>` : ''}
                        </div>
                    `;
                    document.getElementById('contact-container').innerHTML = `
                        <div class="contacto">
                            <div class="horariosDeAtencion">
                                <h4>HORARIOS DE ATENCIÓN WHATSAPP</h4>
                                <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[0] ? firstRegionData.horariosDeAtencion[0] : ''}</p>
                                <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[1] ? firstRegionData.horariosDeAtencion[1] : ''}</p>
                                <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[2] ? firstRegionData.horariosDeAtencion[2] : ''}</p>
                            </div>
                        </div>
                        <div class="contacto-2">
                            <div class="numerosDeAtencion">
                                <ul>
                                    <li><img src="img/Logo Telefono.png" alt="Phone Icon" /> ${firstRegionData.numerosDeAtencion && firstRegionData.numerosDeAtencion[0] ? firstRegionData.numerosDeAtencion[0] : 'No disponible'}</li>
                                    <li><img src="img/Logo Whatsapp.png" alt="WhatsApp Icon" /> ${firstRegionData.numerosDeAtencion && firstRegionData.numerosDeAtencion[1] ? firstRegionData.numerosDeAtencion[1] : 'No disponible'}</li>
                                </ul>
                            </div>
                        </div>
                    `;
                } else {
                    document.getElementById('info-container').innerHTML = '<p>Información no disponible</p>';
                    document.getElementById('contact-container').innerHTML = '';
                }

                showInfoContainers();
            };

            const hideInfoContainers = function() {
                document.getElementById('info-container').style.display = 'none';
                document.getElementById('contact-container').style.display = 'none';
            };

            const showInfoContainers = function() {
                document.getElementById('info-container').style.display = 'block';
                document.getElementById('contact-container').style.display = 'block';
            };

            const animateMapAndInfo = function(showInfo) {
                if (showInfo) {
                    mapContainer.style.transform = 'translateY(50px)'; // Desplazar mapa hacia abajo
                    infoContactContainer.style.marginTop = '20px'; // Ajustar margen superior del contenedor de información
                    infoContactContainer.style.marginBottom = '80px'; // Asegurar margen inferior del contenedor de información
                } else {
                    mapContainer.style.transform = 'translateY(0)'; // Restablecer posición original del mapa
                    infoContactContainer.style.marginTop = '20px'; // Restablecer margen superior del contenedor de información
                    infoContactContainer.style.marginBottom = '20px'; // Restablecer margen inferior del contenedor de información
                }
            };

            areas.forEach(area => {
                area.addEventListener('click', handleClick);
                area.addEventListener('mouseover', handleMouseOver);
                area.addEventListener('mouseout', handleMouseOut);
            });

            document.addEventListener('click', function(event) {
                const infoContainer = document.getElementById('info-container');
                const contactContainer = document.getElementById('contact-container');
                if (!Array.from(areas).some(area => area.contains(event.target))) {
                    regionSeleccionada = null;
                    hideInfoContainers();
                    resetColors(); // Restablecer los colores si se hace clic fuera de las áreas
                    animateMapAndInfo(false); // Animación para desplazar el mapa y la información hacia arriba
                    dynamicTitle.innerText = defaultTitle; // Restaurar el título por defecto
                }
            });
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));

    function getRegionGroup(idArea) {
        for (const group in datos) {
            if (datos[group][idArea]) {
                return group;
            }
        }
        return null;
    }
};
