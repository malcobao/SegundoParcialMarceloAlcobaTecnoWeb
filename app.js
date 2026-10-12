const API_KEY = 'e494cf4291b57f5dd244b54f7e0b14c7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


// ############################################################################
// #                                                                          #
// #                          TU CÓDIGO AQUÍ                    #
// #                                                                          #
// ############################################################################

//5. Manejo de errores: según el error se muestra un mensaje u otro
const manejarError = (error) =>{
    console.log(error);
    if(error.message.includes('401')){
        mostrarError('API Key inválida');
    }else{
        mostrarError('Error de conexión');
    }
};

//4. Modal de detalle
const mostrarDetalle = (detalle) =>{
    const {name, overview, number_of_seasons, number_of_episodes, genres, status} = detalle;
    //genres es un arreglo de objetos {id, name}: tomamos solo el nombre y los unimos con comas
    const generos = genres.map(genero => genero.name).join(', ');

    modalBody.innerHTML = `
        <h2 class="modal__title">${name}</h2>
        <p class="modal__subtitle">Géneros: ${generos ? generos : 'Sin géneros'}</p>
        <div class="modal__info">
            <span><strong>Temporadas:</strong> ${number_of_seasons}</span>
            <span><strong>Episodios:</strong> ${number_of_episodes}</span>
            <span><strong>Estado:</strong> ${status}</span>
        </div>
        <p class="modal__overview">${overview ? overview : 'Esta serie no tiene sinopsis en español.'}</p>`;
};

const abrirModal = async (id) =>{
    modalBody.innerHTML = '<p class="loading__text">Cargando detalle...</p>';
    modal.classList.add('modal--show');
    try{
        const respuesta = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`);
        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}`);
        }
        const detalle = await respuesta.json();
        mostrarDetalle(detalle);
    }catch(error){
        console.log(error);
        if(error.message.includes('401')){
            modalBody.innerHTML = '<p class="error__message">API Key inválida</p>';
        }else{
            modalBody.innerHTML = '<p class="error__message">Error de conexión</p>';
        }
    }
};

const cerrarModal = () =>{
    modal.classList.remove('modal--show');
};

//2. Tarjeta de serie
const crearTarjetaSerie = (serie) =>{
    const article = document.createElement('article');
    article.className = 'serie-card';
    const {id, name, poster_path, first_air_date, vote_average} = serie;

    //la API a veces trae series sin fecha o sin póster
    const año = first_air_date ? first_air_date.slice(0, 4) : 'Sin fecha';
    let imagen = '<p class="serie-card__sin-imagen">Sin imagen</p>';
    if(poster_path){
        imagen = `<img class="serie-card__image" src="${IMAGE_URL}${poster_path}" alt="${name}">`;
    }

    article.innerHTML = `
        <div class="serie-card__poster">
            ${imagen}
            <span class="serie-card__rating">★ ${vote_average.toFixed(1)}</span>
        </div>
        <div class="serie-card__content">
            <h3 class="serie-card__title">${name}</h3>
            <p class="serie-card__year">📅 ${año}</p>
        </div>`;

    article.addEventListener('click', () =>{
        abrirModal(id);
    });

    return article;
};

const renderizarSeries = (series) =>{
    seriesGrid.innerHTML = '';
    if(series.length === 0){
        resultsCount.textContent = 'No se encontraron series';
        return;
    }
    if(series.length === 1){
        resultsCount.textContent = '1 resultado';
    }else{
        resultsCount.textContent = `${series.length} resultados`;
    }
    series.forEach(serie =>{
        const tarjeta = crearTarjetaSerie(serie);
        seriesGrid.appendChild(tarjeta);
    });
};

//1. Carga inicial: series populares
const obtenerSeriesPopulares = async () =>{
    resultsTitle.textContent = 'Series Populares';
    resultsCount.textContent = '';
    mostrarLoading();
    try{
        const respuesta = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`);
        //fetch no da error con un 401, por eso revisamos ok y lanzamos el error nosotros
        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        ocultarLoading();
        renderizarSeries(datos.results);
        console.log('Series populares cargadas');
    }catch(error){
        manejarError(error);
    }
};

//3. Búsqueda por texto
const buscarSeries = async (texto) =>{
    resultsTitle.textContent = `Resultados para "${texto}"`;
    resultsCount.textContent = '';
    mostrarLoading();
    try{
        const respuesta = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(texto)}&language=es-ES`);
        if(!respuesta.ok){
            throw new Error(`Error ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        //si el usuario siguió escribiendo, esta respuesta ya es vieja y no se muestra
        if(texto !== searchInput.value.trim()){
            return;
        }
        ocultarLoading();
        renderizarSeries(datos.results);
    }catch(error){
        manejarError(error);
    }
};

const manejarBusqueda = () =>{
    const texto = searchInput.value.trim();
    if(texto === ''){
        obtenerSeriesPopulares();
    }else{
        buscarSeries(texto);
    }
};

const limpiarBusqueda = () =>{
    searchInput.value = '';
    obtenerSeriesPopulares();
};

searchInput.addEventListener('input', manejarBusqueda);
clearBtn.addEventListener('click', limpiarBusqueda);
retryBtn.addEventListener('click', manejarBusqueda);
modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);
console.log('Eventos configurados');

obtenerSeriesPopulares();
