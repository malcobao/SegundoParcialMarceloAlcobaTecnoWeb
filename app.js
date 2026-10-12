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

//2. Tarjeta de serie
const crearTarjetaSerie = (serie) =>{
    const article = document.createElement('article');
    article.className = 'serie-card';
    const {name, poster_path, first_air_date, vote_average} = serie;

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
    const respuesta = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`);
    const datos = await respuesta.json();
    ocultarLoading();
    renderizarSeries(datos.results);
    console.log('Series populares cargadas');
};

obtenerSeriesPopulares();
