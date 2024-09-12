window.onload = function() {
    let datos;
    let regionSeleccionada = null; // Variable para almacenar la región actualmente seleccionada
    const defaultTitle = "Elija una región para ver las líneas de atención."; // Título por defecto

    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            datos = data;

            const areas = document.querySelectorAll('svg path');
            const mapContainer = document.getElementById('map-container');
            const infoContactContainer = document.getElementById('info-contact-container');
            const dynamicTitle = document.getElementById('dynamic-title');
            const tooltip = document.getElementById('tooltip');
            const iframe = document.getElementById('region-map'); // Selecciona el iframe
            const enlaceBooking = document.getElementById('enlaceBooking'); // Selecciona el enlace de booking
            const bookingContainer = document.getElementById('bookingContainer'); // Selecciona el contenedor de booking
            const jurisdiccion = document.getElementById('jurisdiccion'); // Muestra la jurisdicción
            const jurisdictionContainer = document.getElementById('jurisdictionContainer'); // Muestra el contenedor de jurisdicción

            const handleClick = function(event) {
                event.stopPropagation();
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);

                if (regionGroup === regionSeleccionada) {
                    regionSeleccionada = null;
                    hideInfoContainers();
                    resetColors();
                    animateMapAndInfo(false);
                    dynamicTitle.innerText = defaultTitle;
                    tooltip.style.display = 'none'; // Oculta el tooltip cuando se deselecciona una región
                    iframe.src = ''; // Limpia la URL del iframe
                    bookingContainer.style.display = 'none'; // Oculta el contenedor de booking
                    jurisdictionContainer.style.display = 'none'; // Oculta el contenedor de jurisdicción

                } else {
                    regionSeleccionada = regionGroup;
                    showRegionInfo(regionGroup);
                    resetColors();
                    highlightRegionGroup(regionGroup);
                    animateMapAndInfo(true);
                    dynamicTitle.innerText = regionGroup;
                }
            };

            const handleMouseOver = function(event) {
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);
                if (regionGroup !== regionSeleccionada) {
                    this.setAttribute('fill', '#abcd73');
                    const title = this.getAttribute('title') || regionGroup;
                    tooltip.innerText = title;
                    tooltip.style.display = 'block';
            
                    // Calcular la posición inicial del tooltip
                    const areaRect = event.target.getBoundingClientRect();
                    const mapRect = mapContainer.getBoundingClientRect();
                    let tipX = event.clientX - mapRect.left - (tooltip.offsetWidth / 2);
                    let tipY = event.clientY - mapRect.top - tooltip.offsetHeight - 10;
            
                    // Ajustar la posición si el tooltip se sale por los bordes del contenedor del mapa
                    if (tipX + tooltip.offsetWidth > mapRect.width) {
                        tipX = mapRect.width - tooltip.offsetWidth - 10; // Ajustar para que no se salga por el borde derecho
                    }
                    if (tipX < 0) {
                        tipX = 10; // Ajustar para que no se salga por el borde izquierdo
                    }
                    if (tipY + tooltip.offsetHeight > mapRect.height) {
                        tipY = mapRect.height - tooltip.offsetHeight - 10; // Ajustar para que no se salga por el borde inferior
                    }
                    if (tipY < 0) {
                        tipY = 10; // Ajustar para que no se salga por el borde superior
                    }
            
                    tooltip.style.left = `${tipX}px`;
                    tooltip.style.top = `${tipY}px`;
                }
            };
            

            const handleMouseOut = function() {
                const idArea = this.getAttribute('id');
                const regionGroup = getRegionGroup(idArea);
                if (regionGroup !== regionSeleccionada) {
                    this.setAttribute('fill', '#139EC8');
                    tooltip.style.display = 'none';
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
                const firstRegionData = regionData[Object.keys(regionData)[0]];

                if (firstRegionData) {
                    document.getElementById('info-container').innerHTML = 
                    `<div class="titulo-container">
                        <h3>SEDE PRINCIPAL</h3>
                        <p><strong>${firstRegionData.ciudadSede ? firstRegionData.ciudadSede.split(',')[0] : 'No disponible'}</strong></p>
                        <p>
                            ${firstRegionData.direccion ? 
                                `<span class="location-icon" onclick="openGoogleMaps('${firstRegionData.direccion}')">
                                    <img src="img/location2.png" alt="Location Icon" />
                                </span>
                                ${firstRegionData.direccion}`
                             : 'No disponible'}
                        </p>
                    </div>`;

                    document.getElementById('contact-container').innerHTML = 
                    `<div class="contacto">
                        <div class="horariosDeAtencion">
                            <h4>HORARIOS DE ATENCIÓN</h4>
                            <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[0] ? firstRegionData.horariosDeAtencion[0] : ''}</p>
                            <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[1] ? firstRegionData.horariosDeAtencion[1] : ''}</p>
                            <p>${firstRegionData.horariosDeAtencion && firstRegionData.horariosDeAtencion[2] ? firstRegionData.horariosDeAtencion[2] : ''}</p>
                        </div>
                    </div>

                    <div class="numerosDeAtencion">
                        <ul>
                            <li><img src="img/Logo_Telefono.png" alt="Phone Icon" /> ${firstRegionData.numerosDeAtencion && firstRegionData.numerosDeAtencion[0] ? firstRegionData.numerosDeAtencion[0] : 'No disponible'}</li>
                            <li><img src="img/Logo Whatsapp.png" alt="WhatsApp Icon" /> ${firstRegionData.numerosDeAtencion && firstRegionData.numerosDeAtencion[1] ? firstRegionData.numerosDeAtencion[1] : 'No disponible'}</li>
                        </ul>
                    </div>`;

                    iframe.src = firstRegionData.mapa[0] || ''; // Actualiza la URL del iframe con el primer mapa disponible
                    enlaceBooking.href = firstRegionData.enlacebooking ? firstRegionData.enlacebooking[0] : '#'; // Actualiza el enlace de booking
                    bookingContainer.style.display = 'block'; // Muestra el contenedor de booking
                    
                    // Actualiza la información de jurisdicción
                    document.getElementById('jurisdiccion').innerText = firstRegionData.jurisdiccion ? firstRegionData.jurisdiccion[0] : 'No disponible';
                    jurisdictionContainer.style.display = 'block'; // Muestra el contenedor de jurisdicción
                } else {
                    document.getElementById('info-container').innerHTML = '<p>Información no disponible</p>';
                    document.getElementById('contact-container').innerHTML = '';
                    iframe.src = ''; // Limpia la URL del iframe si no hay datos
                    enlaceBooking.href = '#'; // Resetea el enlace de booking
                    bookingContainer.style.display = 'none'; // Oculta el contenedor de booking si no hay datos
                    document.getElementById('jurisdiccion').innerText = 'Información no disponible'; // Resetea la información de jurisdicción
                    jurisdictionContainer.style.display = 'none'; // Oculta el contenedor de jurisdicción si no hay datos
                }

                showInfoContainers();
            };

            const hideInfoContainers = function() {
                document.getElementById('info-container').style.display = 'none';
                document.getElementById('contact-container').style.display = 'none';
                iframe.src = ''; // Limpia la URL del iframe
                bookingContainer.style.display = 'none'; // Oculta el contenedor de booking
            };

            const showInfoContainers = function() {
                document.getElementById('info-container').style.display = 'block';
                document.getElementById('contact-container').style.display = 'block';
            };

            const animateMapAndInfo = function(showInfo) {
                if (showInfo) {
                    mapContainer.style.transform = 'translateX(5%)';
                    infoContactContainer.style.marginTop = '20px';
                    infoContactContainer.style.marginBottom = '80px';
                } else {
                    mapContainer.style.transform = 'translateX(38%)';
                    infoContactContainer.style.marginTop = '20px';
                    infoContactContainer.style.marginBottom = '20px';
                }
            };

            const getRegionGroup = function(id) {
                for (const group in datos) {
                    if (datos[group][id]) {
                        return group;
                    }
                }
                return null;
            };

            areas.forEach(area => {
                area.addEventListener('click', handleClick);
                area.addEventListener('mouseover', handleMouseOver);
                area.addEventListener('mouseout', handleMouseOut);
            });
        })
        .catch(error => console.error('Error al cargar los datos:', error));
};
