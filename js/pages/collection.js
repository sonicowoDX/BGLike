import {
    obtenerJuegosColeccion
} from "../services/collections.service.js";

import {
    actualizarImagenJuego
} from "../services/games.service.js";

import {
    obtenerReaccionesUsuario,
    obtenerReaccionesColeccion,
    actualizarReaccion
} from "../services/reactions.service.js";

import {
    calcularMetricasJuego
} from "../utils/scoring.js";

import {
    crearGameCard
} from "../components/game-card.js";

import {
    obtenerUsuariosColeccion
} from "../services/users.service.js";

let ultimoJuegoFeelingLuckyId =
    null;

let scoreMatrix = [
    [
        "Nombre Jugador",
        "Rubro 1",
        "SUMA FINAL"
    ],
    [
        "Jugador 1",
        "",
        "0"
    ]
];

let allGames = [];

let currentSession = null;

let allReactions = [];

let allUsers = [];

let selectedPlayerIds =
    new Set();

let selectedGameTypes =
    new Set([
        "standalone",
        "expansion"
    ]);

let startingPlayerGuests =
    [];


let startingPlayerRunning =
    false;

let visibleGames = [];

let luckyRunning = false;

let currentImageGame =
    null;

let activeQuickFilter =
    null;

let candidates;

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const session =
            obtenerSesionLocal();


        if (!session) {

            window.location.href =
                "../index.html";

            return;

        }

        currentSession =
            session;


        cargarEncabezado(
            session
        );


        inicializarEventos(
            session
        );


        await cargarJuegos(
            session
        );

    }
);


function obtenerSesionLocal() {

    const collectionId =
        localStorage.getItem(
            "bglike_collection_id"
        );

    const collectionCode =
        localStorage.getItem(
            "bglike_collection_code"
        );

    const userId =
        localStorage.getItem(
            "bglike_user_id"
        );

    const nickname =
        localStorage.getItem(
            "bglike_user_nickname"
        );


    if (
        !collectionId ||
        !collectionCode ||
        !userId ||
        !nickname
    ) {

        return null;

    }


    return {

        collectionId:
            Number(
                collectionId
            ),

        collectionCode,

        userId:
            Number(
                userId
            ),

        nickname

    };

}


function cargarEncabezado(
    session
) {

    document.getElementById(
        "collectionCode"
    ).textContent =
        session.collectionCode;


    document.getElementById(
        "currentNickname"
    ).textContent =
        session.nickname;

}


function inicializarEventos(
    session
) {

    document.getElementById(
        "btnScoreMatrix"
    )
        .addEventListener(
            "click",
            abrirScoreMatrix
        );


    document.getElementById(
        "btnCloseScoreMatrix"
    )
        .addEventListener(
            "click",
            cerrarScoreMatrix
        );


    document.getElementById(
        "scoreMatrixBackdrop"
    )
        .addEventListener(
            "click",
            cerrarScoreMatrix
        );


    document.getElementById(
        "btnAddScoreRow"
    )
        .addEventListener(
            "click",
            agregarFilaScore
        );

    document.getElementById(
        "btnDeleteScoreRow"
    )
        .addEventListener(
            "click",
            EliminarFilaScore
        );

    document.getElementById(
        "btnDeleteScoreColumn"
    )
        .addEventListener(
            "click",
            eliminarColumnaScore
        );


    document.getElementById(
        "btnAddScoreColumn"
    )
        .addEventListener(
            "click",
            agregarColumnaScore
        );


    document.getElementById(
        "btnClearScoreMatrix"
    )
        .addEventListener(
            "click",
            limpiarScoreMatrix
        );  

    document.getElementById(
        "btnCloseStartingPlayer"
    )
        .addEventListener(
            "click",
            cerrarStartingPlayer
        );


    document.getElementById(
        "startingPlayerBackdrop"
    )
        .addEventListener(
            "click",
            cerrarStartingPlayer
        );

    document.getElementById(
    "btnSpinStartingPlayer"
    )
        .addEventListener(
            "click",
            elegirStartingPlayer
        );

    const btnAddGuest =
    document.getElementById(
        "btnAddStartingPlayerGuest"
    );


    btnAddGuest.addEventListener(
        "click",
        agregarStartingPlayerGuest
    );

    const btnStartingPlayer =
    document.getElementById(
        "btnStartingPlayer"
    );


    btnStartingPlayer.addEventListener(
        "click",
        abrirStartingPlayer
    );

    const playingTimeMin =
    document.getElementById(
        "playingTimeMin"
    );


    const playingTimeMax =
        document.getElementById(
            "playingTimeMax"
        );


    const minimumScore =
        document.getElementById(
            "minimumScore"
        );


    playingTimeMin.addEventListener(
        "input",
        aplicarFiltros
    );


    playingTimeMax.addEventListener(
        "input",
        aplicarFiltros
    );


    minimumScore.addEventListener(
        "input",
        aplicarFiltros
    );

    const quickFilterButtons =
    document.querySelectorAll(
        ".quick-filter-chip"
    );


    quickFilterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        button.dataset.quickFilter;


                    /*
                    * Pulsar nuevamente
                    * el mismo chip lo limpia.
                    */

                    if (
                        activeQuickFilter ===
                        filter
                    ) {

                        activeQuickFilter =
                            null;

                    }
                    else {

                        activeQuickFilter =
                            filter;

                    }


                    actualizarChipsRapidos();


                    aplicarFiltros();

                }
            );

        }
    );

    const weightMin =
    document.getElementById(
        "weightMin"
    );


    const weightMax =
        document.getElementById(
            "weightMax"
        );


    const playerCountFilter =
        document.getElementById(
            "playerCountFilter"
        );


    weightMin.addEventListener(
        "input",
        aplicarFiltros
    );


    weightMax.addEventListener(
        "input",
        aplicarFiltros
    );


    playerCountFilter.addEventListener(
        "change",
        aplicarFiltros
    );

    const shareCollection =
        document.getElementById(
            "btnShareCollection"
        );


    shareCollection.addEventListener(
        "click",
        function () {

            compartirColeccion(
                session
            );

        }
    );

    const gamesGrid =
        document.getElementById(
            "gamesGrid"
        );


    gamesGrid.addEventListener(
        "click",
        function (
            event
        ) {

            const button =
                event.target.closest(
                    "[data-add-image]"
                );


            if (!button) {

                return;

            }


            const card =
                button.closest(
                    ".game-card"
                );


            if (!card) {

                return;

            }


            const gameId =
                Number(
                    card.dataset.gameId
                );


            const game =
                allGames.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        gameId
                );


            if (!game) {

                return;

            }


            abrirModalImagen(
                game
            );

        }
    );

    document.getElementById(
        "imageLinkForm"
    )
        .addEventListener(
            "submit",
            async function (
                event
            ) {

                event.preventDefault();


                await guardarImagenJuego();

            }
        );

    document.getElementById(
        "startingPlayerGuestName"
    )
        .addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key === "Enter"
                ) {

                    agregarStartingPlayerGuest();

                }

            }
        );

    document.getElementById(
        "btnCloseImageLink"
    )
        .addEventListener(
            "click",
            cerrarModalImagen
        );


    document.getElementById(
        "imageLinkBackdrop"
    )
        .addEventListener(
            "click",
            cerrarModalImagen
        );

    const btnFeelingLucky =
    document.getElementById(
        "btnFeelingLucky"
    );


    const btnCloseLucky =
        document.getElementById(
            "btnCloseLucky"
        );


    const luckyBackdrop =
        document.getElementById(
            "luckyBackdrop"
        );


    const btnSpinAgain =
        document.getElementById(
            "btnSpinAgain"
        );


    btnFeelingLucky.addEventListener(
        "click",
        function () {

            abrirFeelingLucky();

        }
    );


    btnCloseLucky.addEventListener(
        "click",
        cerrarFeelingLucky
    );


    luckyBackdrop.addEventListener(
        "click",
        cerrarFeelingLucky
    );


    btnSpinAgain.addEventListener(
        "click",
        function () {

            iniciarFeelingLucky(ultimoJuegoFeelingLuckyId);

        }
    );

    const typeButtons =
    document.querySelectorAll(
        ".type-filter-button"
    );


    typeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const type =
                        button.dataset.gameType;


                    toggleTipoJuego(
                        type,
                        button
                    );

                }
            );

        }
    );

    const btnSelectAllPlayers =
    document.getElementById(
        "btnSelectAllPlayers"
    );


    const btnClearPlayers =
        document.getElementById(
            "btnClearPlayers"
        );


    btnSelectAllPlayers.addEventListener(
        "click",
        function () {

            selectedPlayerIds =
                new Set(
                    allUsers.map(
                        user =>
                            Number(
                                user.id
                            )
                    )
                );


            actualizarEstadoBotonesJugadores();

            actualizarMetricasYVista();

        }
    );


    btnClearPlayers.addEventListener(
        "click",
        function () {

            selectedPlayerIds.clear();


            actualizarEstadoBotonesJugadores();

            actualizarMetricasYVista();

        }
    );

    const search =
        document.getElementById(
            "gameSearch"
        );

    const sort =
        document.getElementById(
            "gameSort"
        );

    const changeUser =
        document.getElementById(
            "btnChangeUser"
        );


    search.addEventListener(
        "input",
        aplicarFiltros
    );


    sort.addEventListener(
        "change",
        aplicarFiltros
    );


    changeUser.addEventListener(
        "click",
        function () {

            window.location.href =
                `../pages/unirse.html?codigo=${
                    encodeURIComponent(
                        session.collectionCode
                    )
                }`;

        }
    );

}


async function cargarJuegos(
    session
) {

    const loading =
        document.getElementById(
            "loadingCollection"
        );


    try {

        const [
                games,
                userReactions,
                collectionReactions,
                users
            ] =
            await Promise.all([
                obtenerJuegosColeccion(
                    session.collectionId
                ),

                obtenerReaccionesUsuario(
                    session.userId
                ),

                obtenerReaccionesColeccion(
                    session.collectionId
                ),

                obtenerUsuariosColeccion(
                    session.collectionId
                )
            ]);

            allUsers =
                users;


            selectedPlayerIds =
                new Set(
                    allUsers.map(
                        user =>
                            Number(
                                user.id
                            )
                    )
                );


            renderFiltrosJugadores();


        allReactions =
            collectionReactions;


        const userReactionMap =
            new Map();


        for (
            const reaction
            of userReactions
        ) {

            userReactionMap.set(
                Number(
                    reaction.id_juego
                ),
                reaction.reaccion
            );

        }


        allGames =
            games.map(
                game => ({

                    ...game,

                    reaccion:
                        userReactionMap.get(
                            Number(
                                game.id
                            )
                        )
                        ?? "NO_JUGADO",

                    reactionCounts: {
                        ODIAR: 0,
                        DISLIKE: 0,
                        NO_JUGADO: 0,
                        LIKE: 0,
                        FAVORITO: 0
                    },

                    score: 0

                })
            );

            recalcularMetricasConFiltros();

            actualizarMatchGrupo();

            document.getElementById(
                "gameCount"
            ).textContent =
                allGames.length;


            aplicarFiltros();


        document.getElementById(
            "gameCount"
        ).textContent =
            allGames.length;


        aplicarFiltros();

    }
    catch (
        error
    ) {

        mostrarError(
            error.message
        );

    }
    finally {

        loading.hidden =
            true;

    }

}


function aplicarFiltros() {

    const playingTimeMinValue =
    document.getElementById(
        "playingTimeMin"
    )
        .value;


    const playingTimeMaxValue =
        document.getElementById(
            "playingTimeMax"
        )
            .value;


    const minimumScoreValue =
        document.getElementById(
            "minimumScore"
        )
            .value;


    const playingTimeMin =
        playingTimeMinValue === ""
            ? null
            : Number(
                playingTimeMinValue
            );


    const playingTimeMax =
        playingTimeMaxValue === ""
            ? null
            : Number(
                playingTimeMaxValue
            );


    const minimumScore =
        minimumScoreValue === ""
            ? null
            : Number(
                minimumScoreValue
            );

    const search =
        document.getElementById(
            "gameSearch"
        )
            .value
            .trim()
            .toLowerCase();


    const sort =
        document.getElementById(
            "gameSort"
        )
            .value;
    
    const weightMinValue =
    document.getElementById(
        "weightMin"
    )
        .value;

    const weightMaxValue =
        document.getElementById(
            "weightMax"
        )
            .value;


    const playerCountValue =
        document.getElementById(
            "playerCountFilter"
        )
            .value;


    const weightMin =
        weightMinValue === ""
            ? null
            : Number(
                weightMinValue
            );


    const weightMax =
        weightMaxValue === ""
            ? null
            : Number(
                weightMaxValue
            );


    const playerCount =
        playerCountValue === ""
            ? null
            : Number(
                playerCountValue
            );

    let games =
        allGames.filter(
            game => {

                /*
                * Filtro de tipo.
                */

                const gameType =
                    obtenerTipoJuego(
                        game.itemtype
                    );


                if (
                    !selectedGameTypes.has(
                        gameType
                    )
                ) {

                    return false;

                }

                /*
                * Filtro de peso.
                */

                const gameWeight =
                    Number(
                        game.avgweight
                    );


                if (
                    weightMin !== null
                    &&
                    (
                        !Number.isFinite(
                            gameWeight
                        )
                        ||
                        gameWeight < weightMin
                    )
                ) {

                    return false;

                }


                if (
                    weightMax !== null
                    &&
                    (
                        !Number.isFinite(
                            gameWeight
                        )
                        ||
                        gameWeight > weightMax
                    )
                ) {

                    return false;

                }

                /*
                * Filtro por cantidad
                * de jugadores.
                */

                if (
                    playerCount !== null
                ) {

                    const minPlayers =
                        Number(
                            game.minplayers
                        );


                    const maxPlayers =
                        Number(
                            game.maxplayers
                        );


                    if (
                        !Number.isFinite(
                            minPlayers
                        )
                        ||
                        !Number.isFinite(
                            maxPlayers
                        )
                        ||
                        playerCount < minPlayers
                        ||
                        playerCount > maxPlayers
                    ) {

                        return false;

                    }

                }

                /*
                * Filtro de duración.
                *
                * playingtime = 0 se considera
                * duración desconocida.
                */

                if (
                    playingTimeMin !== null
                    ||
                    playingTimeMax !== null
                ) {

                    const playingTime =
                        Number(
                            game.playingtime
                        );


                    /*
                    * Sin duración conocida:
                    * no participa cuando existe
                    * un filtro de tiempo activo,
                    * o cuando no hay jugadores.
                    */

                    if (
                        !Number.isFinite(
                            playingTime
                        )
                        ||
                        playingTime <= 0
                    ) {

                        return false;

                    }


                    if (
                        playingTimeMin !== null
                        &&
                        playingTime <
                            playingTimeMin
                    ) {

                        return false;

                    }


                    if (
                        playingTimeMax !== null
                        &&
                        playingTime >
                            playingTimeMax
                    ) {

                        return false;

                    }

                }

                /*
                * Filtro de score mínimo
                * calculado con los jugadores
                * actualmente seleccionados.
                */

                if (
                    minimumScore !== null
                ) {

                    const gameScore =
                        numeroSeguro(
                            game.score,
                            0
                        );


                    if (
                        gameScore <
                        minimumScore
                    ) {

                        return false;

                    }

                }

                /*
                * Filtros rápidos.
                */

                if (
                    !cumpleFiltroRapido(
                        game
                    )
                ) {

                    return false;

                }


                /*
                * Filtro de búsqueda.
                */

                if (!search) {

                    return true;

                }


                const name =
                    String(
                        game.objectname ?? ""
                    )
                        .toLowerCase();


                const original =
                    String(
                        game.originalname ?? ""
                    )
                        .toLowerCase();


                return (
                    name.includes(
                        search
                    ) ||
                    original.includes(
                        search
                    )
                );

            }
        );
    
    games =
        ordenarJuegos(
            games,
            sort
        );
    
    if (
        activeQuickFilter ===
        "top"
    ) {

        games.sort(
            (
                a,
                b
            ) => {

                const scoreDifference =
                    numeroSeguro(
                        b.score,
                        0
                    ) -
                    numeroSeguro(
                        a.score,
                        0
                    );


                if (
                    scoreDifference !== 0
                ) {

                    return scoreDifference;

                }


                return String(
                    a.objectname ?? ""
                ).localeCompare(
                    String(
                        b.objectname ?? ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );

    }


    visibleGames =
        games;


    renderJuegos(
        games
    );


    actualizarEstadoFeelingLucky();

}


function ordenarJuegos(
    games,
    sort
) {

    const result =
        [...games];

    


    switch (
        sort
    ) {

        case "rating-desc":

            result.sort(
                (
                    a,
                    b
                ) =>
                    numeroSeguro(
                        b.my_rating,
                        -1
                    ) -
                    numeroSeguro(
                        a.my_rating,
                        -1
                    )
            );

            break;


        case "rating-asc":

            result.sort(
                (
                    a,
                    b
                ) =>
                    numeroSeguro(
                        a.my_rating,
                        999
                    ) -
                    numeroSeguro(
                        b.my_rating,
                        999
                    )
            );

            break;


        case "weight-desc":

            result.sort(
                (
                    a,
                    b
                ) =>
                    numeroSeguro(
                        b.avgweight,
                        -1
                    ) -
                    numeroSeguro(
                        a.avgweight,
                        -1
                    )
            );

            break;


        case "score":

            result.sort(
                (
                    a,
                    b
                ) => {

                    const scoreA =
                        numeroSeguro(
                            a.score,
                            0
                        );

                    const scoreB =
                        numeroSeguro(
                            b.score,
                            0
                        );

                    if (
                        scoreA !== scoreB
                    ) {

                        return scoreB - scoreA;

                    }

                    return String(
                        a.objectname ?? ""
                    ).localeCompare(
                        String(
                            b.objectname ?? ""
                        ),
                        "es",
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );

            break;


        case "weight-asc":

            result.sort(
                (
                    a,
                    b
                ) =>
                    numeroSeguro(
                        a.avgweight,
                        999
                    ) -
                    numeroSeguro(
                        b.avgweight,
                        999
                    )
            );

            break;


        case "name":
        default:

            result.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.objectname ?? ""
                    )
                        .localeCompare(
                            String(
                                b.objectname ?? ""
                            ),
                            "es",
                            {
                                sensitivity:
                                    "base"
                            }
                        )
            );

            break;

    }


    return result;

}

function renderJuegos(
    games
) {
    document.getElementById(
        "gameCount"
    ).textContent =
        games.length;

    const grid =
        document.getElementById(
            "gamesGrid"
        );

    const empty =
        document.getElementById(
            "emptyCollection"
        );


    grid.innerHTML =
        "";


    if (
        games.length === 0
    ) {

        grid.hidden =
            true;


        empty.hidden =
            false;


        actualizarMensajeColeccionVacia();


        return;

    }

    empty.hidden =
        true;


    for (
        const game of games
    ) {

        const card =
            crearGameCard(
                game
            );


        inicializarReaccionesCarta(
            card,
            game
        );

        inicializarDetalleReacciones(
            card,
            game
        );


        grid.appendChild(
            card
        );

    }


    grid.hidden =
        false;

}


function inicializarReaccionesCarta(
    card,
    game
) {

    const buttons =
        card.querySelectorAll(
            ".reaction-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function () {

                    const reaction =
                        button.dataset.reaction;


                    if (!reaction) {

                        return;

                    }


                    /*
                     * Si ya tiene esta
                     * reacción, no hacemos
                     * petición innecesaria.
                     */

                    if (
                        game.reaccion ===
                        reaction
                    ) {

                        return;

                    }


                    await cambiarReaccion(
                        game,
                        card,
                        reaction
                    );

                }
            );

        }
    );

}


async function cambiarReaccion(
    game,
    card,
    reaction
) {

    if (!currentSession) {

        return;

    }


    const buttons =
        card.querySelectorAll(
            ".reaction-button"
        );


    establecerBotonesReaccionDeshabilitados(
        buttons,
        true
    );


    try {

        const previousReaction =
            game.reaccion;

        const result =
            await actualizarReaccion(
                currentSession.userId,
                game.id,
                reaction
            );


        game.reaccion =
            result.reaccion;

        actualizarReaccionEnMemoria(
            currentSession.userId,
            game.id,
            previousReaction,
            result.reaccion
        );


        recalcularMetricasConFiltros();

        actualizarMatchGrupo();


        actualizarReaccionVisual(
            card,
            result.reaccion
        );


        actualizarMetricasCarta(
            card,
            game
        );


        actualizarMetricasCarta(
            card,
            game
        );


        actualizarReaccionVisual(
            card,
            result.reaccion
        );

    }
    catch (
        error
    ) {

        mostrarError(
            error.message
        );

    }
    finally {

        establecerBotonesReaccionDeshabilitados(
            buttons,
            false
        );

    }

}


function actualizarReaccionVisual(
    card,
    currentReaction
) {

    const buttons =
        card.querySelectorAll(
            ".reaction-button"
        );


    buttons.forEach(
        button => {

            const isActive =
                button.dataset.reaction ===
                currentReaction;


            button.classList.toggle(
                "active",
                isActive
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    isActive
                )
            );

        }
    );

}


function establecerBotonesReaccionDeshabilitados(
    buttons,
    disabled
) {

    buttons.forEach(
        button => {

            button.disabled =
                disabled;

        }
    );

}


function numeroSeguro(
    value,
    fallback
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function mostrarError(
    message
) {

    const element =
        document.getElementById(
            "collectionMessage"
        );


    element.textContent =
        message;


    element.hidden =
        false;

}

function actualizarReaccionEnMemoria(
    userId,
    gameId,
    previousReaction,
    newReaction
) {

    const existing =
        allReactions.find(
            reaction =>
                Number(
                    reaction.id_usuario
                ) ===
                    Number(
                        userId
                    )
                &&
                Number(
                    reaction.id_juego
                ) ===
                    Number(
                        gameId
                    )
        );


    if (existing) {

        existing.reaccion =
            newReaction;

        return;

    }


    /*
     * Esto solamente debería ocurrir
     * si faltaba una relación por
     * alguna razón.
     */

    allReactions.push({
        id_usuario:
            userId,

        id_juego:
            gameId,

        reaccion:
            newReaction
    });

}

function actualizarMetricasCarta(
    card,
    game
) {

    const reactionTypes = [
        "ODIAR",
        "DISLIKE",
        "NO_JUGADO",
        "LIKE",
        "FAVORITO"
    ];


    for (
        const reaction
        of reactionTypes
    ) {

        const element =
            card.querySelector(
                `[data-count-reaction="${reaction}"]`
            );


        if (!element) {

            continue;

        }


        element.textContent =
            `${obtenerEmojiReaccion(reaction)} ${
                game.reactionCounts?.[reaction] ?? 0
            }`;

    }


    const scoreElement =
        card.querySelector(
            "[data-game-score]"
        );


    if (!scoreElement) {

        return;

    }


    scoreElement.textContent =
        formatearScore(
            game.score
        );


    scoreElement.classList.remove(
        "score-positive",
        "score-negative",
        "score-neutral"
    );


    if (
        game.score > 0
    ) {

        scoreElement.classList.add(
            "score-positive"
        );

    }
    else if (
        game.score < 0
    ) {

        scoreElement.classList.add(
            "score-negative"
        );

    }
    else {

        scoreElement.classList.add(
            "score-neutral"
        );

    }

}

function obtenerEmojiReaccion(
    reaction
) {

    switch (
        reaction
    ) {

        case "ODIAR":
            return "💀";

        case "DISLIKE":
            return "👎";

        case "NO_JUGADO":
            return "❔";

        case "LIKE":
            return "👍";

        case "FAVORITO":
            return "⭐";

        default:
            return "";

    }

}


function formatearScore(
    score
) {

    const value =
        Number(
            score
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return "0";

    }


    return value > 0
        ? `+${value}`
        : String(value);

}

function renderFiltrosJugadores() {

    const container =
        document.getElementById(
            "playerFilters"
        );


    container.innerHTML =
        "";


    for (
        const user of allUsers
    ) {

        const userId =
            Number(
                user.id
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "player-filter-button active";


        if (
            currentSession &&
            userId ===
                Number(
                    currentSession.userId
                )
        ) {

            button.classList.add(
                "current"
            );

        }


        button.dataset.userId =
            userId;


        button.setAttribute(
            "aria-pressed",
            "true"
        );


        button.textContent =
            user.apodo;


        button.addEventListener(
            "click",
            function () {

                toggleJugadorFiltro(
                    userId,
                    button
                );

            }
        );


        container.appendChild(
            button
        );

    }

}

function toggleJugadorFiltro(
    userId,
    button
) {

    if (
        selectedPlayerIds.has(
            userId
        )
    ) {

        selectedPlayerIds.delete(
            userId
        );


        button.classList.remove(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "false"
        );

    }
    else {

        selectedPlayerIds.add(
            userId
        );


        button.classList.add(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "true"
        );

    }


    actualizarMetricasYVista();

}

function actualizarEstadoBotonesJugadores() {

    const buttons =
        document.querySelectorAll(
            ".player-filter-button"
        );


    buttons.forEach(
        button => {

            const userId =
                Number(
                    button.dataset.userId
                );


            const selected =
                selectedPlayerIds.has(
                    userId
                );


            button.classList.toggle(
                "active",
                selected
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    selected
                )
            );

        }
    );

}

function recalcularMetricasConFiltros() {

    for (
        const game of allGames
    ) {

        const filteredReactions =
            allReactions.filter(
                reaction => {

                    return (
                        Number(
                            reaction.id_juego
                        ) ===
                            Number(
                                game.id
                            )
                        &&
                        selectedPlayerIds.has(
                            Number(
                                reaction.id_usuario
                            )
                        )
                    );

                }
            );


        const metrics =
            calcularMetricasJuego(
                filteredReactions
            );


        game.reactionCounts =
            metrics.counts;


        game.score =
            metrics.score;

    }

}

function actualizarMetricasYVista() {

    recalcularMetricasConFiltros();


    actualizarMatchGrupo();


    aplicarFiltros();

}

function toggleTipoJuego(
    type,
    button
) {

    if (
        selectedGameTypes.has(
            type
        )
    ) {

        selectedGameTypes.delete(
            type
        );


        button.classList.remove(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "false"
        );

    }
    else {

        selectedGameTypes.add(
            type
        );


        button.classList.add(
            "active"
        );


        button.setAttribute(
            "aria-pressed",
            "true"
        );

    }


    aplicarFiltros();

}

function obtenerTipoJuego(
    itemtype
) {

    const type =
        String(
            itemtype ?? ""
        )
            .trim()
            .toLowerCase();


    if (
        type.includes(
            "expansion"
        )
    ) {

        return "expansion";

    }


    return "standalone";

}

function actualizarEstadoFeelingLucky() {

    const button =
        document.getElementById(
            "btnFeelingLucky"
        );


    button.disabled =
        visibleGames.length === 0;

}

function abrirFeelingLucky() {

    if (
        visibleGames.length === 0
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "luckyModal"
        );


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";
    
    ultimoJuegoFeelingLuckyId = null;

    candidates =
            obtenerCandidatosFeelingLucky();

    iniciarFeelingLucky(ultimoJuegoFeelingLuckyId);

}

function cerrarFeelingLucky() {

    if (luckyRunning) {

        return;

    }


    const modal =
        document.getElementById(
            "luckyModal"
        );


    modal.hidden =
        true;


    document.body.style.overflow =
        "";

}

function obtenerCandidatosFeelingLucky() {

    const orderedGames =
        [...visibleGames]
            .sort(
                (
                    a,
                    b
                ) => {

                    const scoreA =
                        numeroSeguro(
                            a.score,
                            0
                        );


                    const scoreB =
                        numeroSeguro(
                            b.score,
                            0
                        );


                    if (
                        scoreA !== scoreB
                    ) {

                        return scoreB - scoreA;

                    }


                    /*
                     * En empate,
                     * ordenar alfabéticamente.
                     */

                    return String(
                        a.objectname ?? ""
                    ).localeCompare(
                        String(
                            b.objectname ?? ""
                        ),
                        "es",
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );


    /*
     * Si hay 15 juegos o menos,
     * participan todos.
     */

    if (
        orderedGames.length <= 15
    ) {

        return orderedGames;

    }


    /*
     * Puesto 15 =
     * índice 14.
     */

    const cutoffScore =
        numeroSeguro(
            orderedGames[14].score,
            0
        );


    /*
     * Si el score del puesto 15
     * es 0 o negativo,
     * mantenemos estrictamente
     * el TOP 15.
     */

    if (
        cutoffScore <= 0
    ) {

        return orderedGames.slice(
            0,
            15
        );

    }


    /*
     * Si el score límite es
     * positivo, incluimos todos
     * los juegos empatados con
     * el puesto 15.
     */

    return orderedGames.filter(
        game =>
            numeroSeguro(
                game.score,
                0
            ) >= cutoffScore
    );

}

function elegirJuegoAleatorio(
    games
) {

    if (
        games.length === 0
    ) {

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            games.length
        );


    return games[index];

}

async function iniciarFeelingLucky(juegoExcluirId = null) {

    if (
        luckyRunning
    ) {

        return;

    }

    
    

    if (
    juegoExcluirId !== null
    ) {

        candidates =
            candidates.filter(
                game =>
                    Number(
                        game.id
                    ) !==
                    Number(
                        juegoExcluirId
                    )
            );

    }


    if (
        candidates.length === 0
    ) {

        return;

    }


    luckyRunning =
        true;


    const btnSpinAgain =
        document.getElementById(
            "btnSpinAgain"
        );


    const closeButton =
        document.getElementById(
            "btnCloseLucky"
        );


    btnSpinAgain.hidden =
        true;


    closeButton.disabled =
        true;


    document.getElementById(
        "luckyCandidateCount"
    ).textContent =
        candidates.length;


    document.getElementById(
        "luckyPlayerCount"
    ).textContent =
        selectedPlayerIds.size;


    /*
     * Elegimos el ganador desde el
     * principio. La animación solamente
     * genera el efecto de ruleta.
     */

    const winner =
        elegirJuegoAleatorio(
            candidates
        );

    ultimoJuegoFeelingLuckyId =
    winner.id;

    const animationGames =
        generarSecuenciaLucky(
            candidates,
            winner
        );


    for (
        let i = 0;
        i < animationGames.length;
        i++
    ) {

        const game =
            animationGames[i];


        mostrarJuegoLucky(
            game,
            false
        );


        /*
         * La animación empieza rápida
         * y se va frenando.
         */

        const progress =
            i /
            animationGames.length;


        const delay =
            60 +
            Math.pow(
                progress,
                2
            ) * 260;


        await esperar(
            delay
        );

    }


    mostrarJuegoLucky(
        winner,
        true
    );


    lanzarConfeti();


    btnSpinAgain.hidden =
        false;


    closeButton.disabled =
        false;


    luckyRunning =
        false;

}

function generarSecuenciaLucky(
    candidates,
    winner
) {

    const sequence = [];

    const totalSteps = 22;


    for (
        let i = 0;
        i < totalSteps;
        i++
    ) {

        sequence.push(
            elegirJuegoAleatorio(
                candidates
            )
        );

    }


    /*
     * Garantizamos que el último
     * elemento mostrado sea el ganador.
     */

    sequence.push(
        winner
    );


    return sequence;

}

function mostrarJuegoLucky(
    game,
    winner
) {

    const name =
        document.getElementById(
            "luckyGameName"
        );


    const score =
        document.getElementById(
            "luckyGameScore"
        );


    const imageContainer =
        document.getElementById(
            "luckyImageContainer"
        );

    const players =
        document.getElementById(
            "luckyPlayerCount"
        );

    const time2play =
        document.getElementById(
            "luckyTimeCount"
        );


    name.textContent =
        winner
            ? `✨ ${game.objectname} ✨`
            : game.objectname;


    /*
     * Reiniciamos la animación
     * del nombre.
     */

    name.classList.remove(
        "spinning"
    );


    void name.offsetWidth;


    name.classList.add(
        "spinning"
    );


    score.textContent =
        `Score ${formatearScore(
            game.score
        )}`;

    time2play.textContent =
        formatearPlayingTime(
            game.playingtime
        );
    
    players.textContent =
        `👥 ${game.minplayers} – ${game.maxplayers}`;

    if (
        game.image_url
    ) {

        imageContainer.innerHTML = `

            <img
                class="lucky-image"
                src="${escapeHTMLAttribute(
                    game.image_url
                )}"
                alt="${escapeHTMLAttribute(
                    game.objectname
                )}">

        `;

    }
    else {

        imageContainer.innerHTML = `

            <div class="lucky-placeholder">
                🎲
            </div>

        `;

    }

}

function esperar(
    milliseconds
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}

function lanzarConfeti() {

    if (
        typeof window.confetti !==
        "function"
    ) {

        return;

    }


    window.confetti({
        particleCount: 120,
        spread: 80,
        origin: {
            y: 0.65
        },

        zIndex: 9999
    });


    setTimeout(
        function () {

            window.confetti({
                particleCount: 70,
                angle: 60,
                spread: 55,
                origin: {
                    x: 0
                }
            });


            window.confetti({
                particleCount: 70,
                angle: 120,
                spread: 55,
                origin: {
                    x: 1
                }
            });

        },
        180
    );

}

function escapeHTMLAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}

function abrirModalImagen(
    game
) {

    currentImageGame =
        game;


    const modal =
        document.getElementById(
            "imageLinkModal"
        );


    const gameName =
        document.getElementById(
            "imageLinkGameName"
        );


    const bggLink =
        document.getElementById(
            "imageLinkBGG"
        );


    const input =
        document.getElementById(
            "imageLinkInput"
        );


    const error =
        document.getElementById(
            "imageLinkError"
        );


    gameName.textContent =
        game.objectname;


    bggLink.href =
        `https://boardgamegeek.com/boardgame/${
            encodeURIComponent(
                game.objectid
            )
        }`;


    input.value =
        "";


    error.textContent =
        "";


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            input.focus();

        },
        50
    );

}

function cerrarModalImagen() {

    document.getElementById(
        "imageLinkModal"
    ).hidden =
        true;


    document.body.style.overflow =
        "";


    currentImageGame =
        null;

}

function validarLinkImagenBGG(
    value
) {

    try {

        const url =
            new URL(
                value
            );


        if (
            url.protocol !== "https:"
        ) {

            return false;

        }


        const hostname =
            url.hostname
                .toLowerCase();


        const dominiosPermitidos = [
            "cf.geekdo-images.com",
            "boardgamegeek.com",
            "www.boardgamegeek.com"
        ];


        return dominiosPermitidos.some(
            domain =>
                hostname === domain
                ||
                hostname.endsWith(
                    `.${domain}`
                )
        );

    }
    catch {

        return false;

    }

}

async function guardarImagenJuego() {

    if (!currentImageGame) {

        return;

    }


    const input =
        document.getElementById(
            "imageLinkInput"
        );


    const errorElement =
        document.getElementById(
            "imageLinkError"
        );


    const button =
        document.getElementById(
            "btnSaveImageLink"
        );


    const imageUrl =
        input.value
            .trim();


    errorElement.textContent =
        "";


    if (!imageUrl) {

        errorElement.textContent =
            "Ingresa el link de la imagen.";

        input.focus();

        return;

    }


    if (
        !validarLinkImagenBGG(
            imageUrl
        )
    ) {

        errorElement.textContent =
            "El enlace debe pertenecer a BoardGameGeek o Geekdo Images.";

        input.focus();

        return;

    }


    const originalText =
        button.textContent;


    try {

        button.disabled =
            true;


        button.textContent =
            "Guardando...";


        const updated =
            await actualizarImagenJuego(
                currentImageGame.id,
                imageUrl
            );


        currentImageGame.image_url =
            updated.image_url;


        cerrarModalImagen();


        aplicarFiltros();

    }
    catch (
        error
    ) {

        errorElement.textContent =
            error.message;

    }
    finally {

        button.disabled =
            false;


        button.textContent =
            originalText;

    }

}

function actualizarMensajeColeccionVacia() {

    const search =
        document.getElementById(
            "gameSearch"
        )
            .value
            .trim();


    const title =
        document.getElementById(
            "emptyCollectionTitle"
        );


    const text =
        document.getElementById(
            "emptyCollectionText"
        );


    /*
     * No hay ningún tipo
     * de juego seleccionado.
     */

    if (
        selectedGameTypes.size === 0
    ) {

        title.textContent =
            "No hay tipos seleccionados";


        text.textContent =
            "Activa Standalone o Expansiones para mostrar juegos.";


        return;

    }


    /*
     * Hay una búsqueda activa,
     * pero no produjo resultados.
     */

    if (search) {

        title.textContent =
            "No encontramos ese juego";


        text.textContent =
            "Prueba con otro término de búsqueda.";


        return;

    }


    /*
     * Estado vacío general.
     */

    title.textContent =
        "No encontramos juegos";


    text.textContent =
        "Prueba modificando los filtros.";

}

async function compartirColeccion(
    session
) {

    const button =
        document.getElementById(
            "btnShareCollection"
        );


    const shareUrl =
        `https://sonicowodx.github.io/BGLike/pages/unirse.html?codigo=${
            encodeURIComponent(
                session.collectionCode
            )
        }`;


    const shareData = {

        title:
            "BGLike",

        text:
            `Únete a mi colección de juegos "${session.collectionCode}" en BGLike.`,

        url:
            shareUrl

    };


    /*
     * En celulares y navegadores
     * compatibles abre el menú
     * nativo de compartir.
     */

    if (
        navigator.share
    ) {

        try {

            await navigator.share(
                shareData
            );

            return;

        }
        catch (
            error
        ) {

            /*
             * Si el usuario simplemente
             * cerró el menú de compartir,
             * no mostramos error.
             */

            if (
                error.name ===
                "AbortError"
            ) {

                return;

            }


            console.warn(
                "No fue posible compartir:",
                error
            );

        }

    }


    /*
     * Fallback:
     * copiar al portapapeles.
     */

    try {

        await navigator.clipboard.writeText(
            shareUrl
        );


        mostrarCompartirCopiado(
            button
        );

    }
    catch (
        error
    ) {

        console.error(
            "No fue posible copiar el enlace:",
            error
        );


        window.prompt(
            "Copia este enlace:",
            shareUrl
        );

    }

}

function mostrarCompartirCopiado(
    button
) {

    const originalText =
        button.innerHTML;


    button.innerHTML =
        "✓ Link copiado";


    button.classList.add(
        "copied"
    );


    setTimeout(
        function () {

            button.innerHTML =
                originalText;


            button.classList.remove(
                "copied"
            );

        },
        1800
    );

}

function actualizarChipsRapidos() {

    const buttons =
        document.querySelectorAll(
            ".quick-filter-chip"
        );


    buttons.forEach(
        button => {

            const active =
                button.dataset.quickFilter ===
                activeQuickFilter;


            button.classList.toggle(
                "active",
                active
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    active
                )
            );

        }
    );

}

function obtenerReaccionesJuegoSeleccionadas(
    gameId
) {

    return allReactions.filter(
        reaction => {

            return (
                Number(
                    reaction.id_juego
                ) ===
                    Number(
                        gameId
                    )
                &&
                selectedPlayerIds.has(
                    Number(
                        reaction.id_usuario
                    )
                )
            );

        }
    );

}

function cumpleFiltroRapido(
    game
) {

    if (
        !activeQuickFilter
    ) {

        return true;

    }


    const reactions =
        obtenerReaccionesJuegoSeleccionadas(
            game.id
        );


    switch (
        activeQuickFilter
    ) {

        /*
         * Score positivo.
         */

        case "top":

            return (
                Number(
                    game.score
                ) > 0
            );


        /*
         * Al menos un favorito.
         */

        case "favorites":

            return reactions.some(
                reaction =>
                    reaction.reaccion ===
                    "FAVORITO"
            );


        /*
         * Todos los presentes
         * lo tienen como NO_JUGADO.
         */

        case "unplayed":

            return (
                reactions.length > 0
                &&
                reactions.length ===
                    selectedPlayerIds.size
                &&
                reactions.every(
                    reaction =>
                        reaction.reaccion ===
                        "NO_JUGADO"
                )
            );


        /*
         * Todos los presentes
         * quieren jugarlo.
         */

        case "everyone":

            return (
                reactions.length > 0
                &&
                reactions.length ===
                    selectedPlayerIds.size
                &&
                reactions.every(
                    reaction =>
                        reaction.reaccion ===
                            "LIKE"
                        ||
                        reaction.reaccion ===
                            "FAVORITO"
                )
            );


        /*
         * Tiene al menos una opinión
         * positiva y una negativa.
         */

        case "controversial": {

            const positiveCount =
                reactions.filter(
                    reaction =>
                        reaction.reaccion === "LIKE"
                        ||
                        reaction.reaccion === "FAVORITO"
                ).length;


            const negativeCount =
                reactions.filter(
                    reaction =>
                        reaction.reaccion === "DISLIKE"
                        ||
                        reaction.reaccion === "ODIAR"
                ).length;


            const noJugadoCount =
                reactions.filter(
                    reaction =>
                        reaction.reaccion === "NO_JUGADO"
                ).length;


            const totalWithOpinion =
                selectedPlayerIds.size -
                noJugadoCount;


            /*
            * Necesitamos al menos
            * dos personas con opinión.
            */

            if (
                totalWithOpinion < 2
            ) {

                return false;

            }


            const required =
                Math.floor(
                    totalWithOpinion / 2
                );


            return (
                positiveCount >= required
                &&
                negativeCount >= required
            );

        }


        default:

            return true;

    }

}

const MATCH_REACTION_VALUES = {

    ODIAR:
        -2,

    DISLIKE:
        -1,

    LIKE:
        1,

    FAVORITO:
        2

};

function calcularMatchGrupo() {

    const selectedIds =
        [...selectedPlayerIds];


    /*
     * Se requieren mínimo
     * dos jugadores.
     */

    if (
        selectedIds.length < 2
    ) {

        return null;

    }


    let similarityTotal =
        0;


    let comparisons =
        0;


    /*
     * Agrupamos las reacciones
     * por juego.
     */

    const reactionsByGame =
        new Map();


    for (
        const reaction
        of allReactions
    ) {

        const userId =
            Number(
                reaction.id_usuario
            );


        if (
            !selectedPlayerIds.has(
                userId
            )
        ) {

            continue;

        }


        /*
         * NO_JUGADO no representa
         * una preferencia.
         */

        if (
            reaction.reaccion ===
            "NO_JUGADO"
        ) {

            continue;

        }


        const value =
            MATCH_REACTION_VALUES[
                reaction.reaccion
            ];


        if (
            value === undefined
        ) {

            continue;

        }


        const gameId =
            Number(
                reaction.id_juego
            );


        if (
            !reactionsByGame.has(
                gameId
            )
        ) {

            reactionsByGame.set(
                gameId,
                []
            );

        }


        reactionsByGame
            .get(
                gameId
            )
            .push({
                userId,
                value
            });

    }


    /*
     * Comparamos cada pareja
     * dentro de cada juego.
     */

    for (
        const reactions
        of reactionsByGame.values()
    ) {

        if (
            reactions.length < 2
        ) {

            continue;

        }


        for (
            let i = 0;
            i <
            reactions.length - 1;
            i++
        ) {

            for (
                let j = i + 1;
                j <
                reactions.length;
                j++
            ) {

                const difference =
                    Math.abs(
                        reactions[i].value -
                        reactions[j].value
                    );


                /*
                 * La distancia máxima
                 * es 4:
                 *
                 * FAVORITO (+2)
                 * vs
                 * ODIAR (-2)
                 */

                const similarity =
                    1 -
                    (
                        difference /
                        4
                    );


                similarityTotal +=
                    similarity;


                comparisons++;

            }

        }

    }


    if (
        comparisons === 0
    ) {

        return null;

    }


    return Math.round(
        (
            similarityTotal /
            comparisons
        ) *
        100
    );

}

function actualizarMatchGrupo() {

    const container =
        document.getElementById(
            "groupMatch"
        );


    const valueElement =
        document.getElementById(
            "groupMatchValue"
        );


    if (
        !container ||
        !valueElement
    ) {

        return;

    }


    const match =
        calcularMatchGrupo();


    container.classList.remove(
        "match-high",
        "match-medium",
        "match-low"
    );


    if (
        match === null
    ) {

        valueElement.textContent =
            "--";


        container.title =
            "Selecciona al menos dos jugadores con reacciones.";

        return;

    }


    valueElement.textContent =
        `${match}%`;


    if (
        match >= 80
    ) {

        container.classList.add(
            "match-high"
        );

    }
    else if (
        match >= 50
    ) {

        container.classList.add(
            "match-medium"
        );

    }
    else {

        container.classList.add(
            "match-low"
        );

    }


    container.title =
        `Coincidencia de preferencias entre los jugadores seleccionados: ${match}%`;

}

function obtenerNombreUsuario(
    userId
) {

    const user =
        allUsers.find(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    userId
                )
        );


    return (
        user?.apodo
        ??
        "Usuario"
    );

}

function obtenerDetalleReaccionesJuego(
    gameId
) {

    const groups = {

        ODIAR: [],
        DISLIKE: [],
        NO_JUGADO: [],
        LIKE: [],
        FAVORITO: []

    };


    const reactions =
        allReactions.filter(
            reaction =>
                Number(
                    reaction.id_juego
                ) ===
                    Number(
                        gameId
                    )
                &&
                selectedPlayerIds.has(
                    Number(
                        reaction.id_usuario
                    )
                )
        );


    for (
        const reaction
        of reactions
    ) {

        if (
            !groups[
                reaction.reaccion
            ]
        ) {

            continue;

        }


        groups[
            reaction.reaccion
        ].push(
            obtenerNombreUsuario(
                reaction.id_usuario
            )
        );

    }


    return groups;

}

function crearHTMLDetalleReacciones(
    game
) {

    const detail =
        obtenerDetalleReaccionesJuego(
            game.id
        );


    const reactions = [

        {
            type:
                "ODIAR",

            emoji:
                "💀"
        },

        {
            type:
                "DISLIKE",

            emoji:
                "👎"
        },

        {
            type:
                "NO_JUGADO",

            emoji:
                "❔"
        },

        {
            type:
                "LIKE",

            emoji:
                "👍"
        },

        {
            type:
                "FAVORITO",

            emoji:
                "⭐"
        }

    ];


    const rows =
        reactions
            .filter(
                item =>
                    detail[
                        item.type
                    ].length > 0
            )
            .map(
                item => {

                    const users =
                        detail[
                            item.type
                        ];


                    return `

                        <div
                            class="reaction-detail-row">

                            <span
                                class="reaction-detail-emoji">

                                ${item.emoji}

                            </span>


                            <span
                                class="reaction-detail-users">

                                ${users
                                    .map(
                                        escapeHTML
                                    )
                                    .join(
                                        ", "
                                    )}

                            </span>

                        </div>

                    `;

                }
            )
            .join(
                ""
            );


    return `

        <div class="reaction-detail-title">

            Reacciones del grupo

        </div>


        <div class="reaction-detail-list">

            ${
                rows
                ||
                `
                    <div
                        class="reaction-detail-empty">

                        No hay reacciones
                        de los jugadores seleccionados.

                    </div>
                `
            }

        </div>

    `;

}

function inicializarDetalleReacciones(
    card,
    game
) {
    const counts =
    card.querySelector(
        "[data-reaction-counts]"
    );


    if (counts) {

        counts.addEventListener(
            "click",
            function (
                event
            ) {

                event.stopPropagation();


                if (
                    detail.hidden
                ) {

                    mostrarDetalle();

                }
                else {

                    ocultarDetalle();

                }

            }
        );

    }

    const detail =
        card.querySelector(
            "[data-reaction-detail]"
        );


    if (!detail) {

        return;

    }


    function mostrarDetalle() {

        detail.innerHTML =
            crearHTMLDetalleReacciones(
                game
            );


        detail.hidden =
            false;

    }


    function ocultarDetalle() {

        detail.hidden =
            true;

    }


    card.addEventListener(
        "mouseenter",
        mostrarDetalle
    );


    card.addEventListener(
        "mouseleave",
        ocultarDetalle
    );

}

function formatearPlayingTime(
    playingtime
) {

    const minutes =
        Number(
            playingtime
        );


    if (
        !Number.isFinite(
            minutes
        )
        ||
        minutes <= 0
    ) {

        return "⏱️ -";

    }


    if (
        minutes < 60
    ) {

        return `⏱️ ${minutes} min`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    if (
        remainingMinutes === 0
    ) {

        return `⏱️ ${hours} h`;

    }


    return `⏱️ ${hours} h ${remainingMinutes} min`;

}

function abrirStartingPlayer() {

    const modal =
        document.getElementById(
            "startingPlayerModal"
        );


    /*
     * Los invitados temporales
     * empiezan vacíos cada vez
     * que abrimos el modal.
     */

    startingPlayerGuests =
        [];


    document.getElementById(
        "startingPlayerResult"
    ).hidden =
        true;


    renderStartingPlayerParticipants();


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}

function obtenerJugadoresStartingPlayer() {

    const selectedUsers =
        allUsers
            .filter(
                user =>
                    selectedPlayerIds.has(
                        Number(
                            user.id
                        )
                    )
            )
            .map(
                user => ({
                    id:
                        `user-${user.id}`,

                    name:
                        user.apodo,

                    temporary:
                        false
                })
            );


    return [
        ...selectedUsers,
        ...startingPlayerGuests
    ];

}

function renderStartingPlayerParticipants() {

    const container =
        document.getElementById(
            "startingPlayerParticipants"
        );


    const players =
        obtenerJugadoresStartingPlayer();


    container.innerHTML =
        "";


    if (
        players.length === 0
    ) {

        container.innerHTML = `

            <span class="starting-player-empty">
                No hay jugadores seleccionados.
            </span>

        `;


        actualizarEstadoStartingPlayer();

        return;

    }


    for (
        const player of players
    ) {

        const chip =
            document.createElement(
                "div"
            );


        chip.className =
            "starting-player-chip";


        const name =
            document.createElement(
                "span"
            );


        name.textContent =
            player.name;


        chip.appendChild(
            name
        );


        /*
         * Sólo los invitados
         * temporales pueden
         * eliminarse desde aquí.
         */

        if (
            player.temporary
        ) {

            const remove =
                document.createElement(
                    "button"
                );


            remove.type =
                "button";


            remove.textContent =
                "✕";


            remove.title =
                "Quitar invitado";


            remove.addEventListener(
                "click",
                function () {

                    eliminarStartingPlayerGuest(
                        player.id
                    );

                }
            );


            chip.appendChild(
                remove
            );

        }


        container.appendChild(
            chip
        );

    }


    actualizarEstadoStartingPlayer();

}



function agregarStartingPlayerGuest() {

    const input =
        document.getElementById(
            "startingPlayerGuestName"
        );


    const name =
        input.value
            .trim();


    if (!name) {

        return;

    }


    const allPlayers =
        obtenerJugadoresStartingPlayer();


    /*
     * Evitar nombres duplicados
     * dentro de este modal.
     */

    const duplicate =
        allPlayers.some(
            player =>
                player.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (
        duplicate
    ) {

        input.select();

        return;

    }


    startingPlayerGuests.push({

        id:
            `guest-${crypto.randomUUID()}`,

        name,

        temporary:
            true

    });


    input.value =
        "";


    renderStartingPlayerParticipants();


    input.focus();

}

function eliminarStartingPlayerGuest(
    id
) {

    startingPlayerGuests =
        startingPlayerGuests.filter(
            player =>
                player.id !== id
        );


    renderStartingPlayerParticipants();

}

async function elegirStartingPlayer() {

    if (
        startingPlayerRunning
    ) {

        return;

    }


    const players =
        obtenerJugadoresStartingPlayer();


    if (
        players.length === 0
    ) {

        return;

    }


    const button =
        document.getElementById(
            "btnSpinStartingPlayer"
        );


    const result =
        document.getElementById(
            "startingPlayerResult"
        );


    const winner =
        document.getElementById(
            "startingPlayerWinner"
        );


    startingPlayerRunning =
        true;


    button.disabled =
        true;


    result.hidden =
        false;


    /*
     * Pequeña animación tipo ruleta.
     */

    const duration =
        1800;


    const interval =
        90;


    const start =
        performance.now();


    await new Promise(
        resolve => {

            const timer =
                setInterval(
                    function () {

                        const randomPlayer =
                            players[
                                Math.floor(
                                    Math.random() *
                                    players.length
                                )
                            ];


                        winner.textContent =
                            randomPlayer.name;


                        if (
                            performance.now() -
                            start >=
                            duration
                        ) {

                            clearInterval(
                                timer
                            );


                            resolve();

                        }

                    },
                    interval
                );

        }
    );


    /*
     * Ganador definitivo.
     */

    const selected =
        players[
            Math.floor(
                Math.random() *
                players.length
            )
        ];


    winner.textContent =
        selected.name;

    /*
    * Celebrar al jugador inicial.
    */

    lanzarConfeti();


    button.textContent =
        "🎲 Elegir de nuevo";


    button.disabled =
        false;


    startingPlayerRunning =
        false;

}

function cerrarStartingPlayer() {

    if (
        startingPlayerRunning
    ) {

        return;

    }


    document.getElementById(
        "startingPlayerModal"
    ).hidden =
        true;

    const button =
        document.getElementById(
            "btnSpinStartingPlayer"
        );

    button.textContent =
        "🎲 Elegir jugador inicial";

    document.body.style.overflow =
        "";

    startingPlayerGuests =
        [];

}

function actualizarEstadoStartingPlayer() {

    const button =
        document.getElementById(
            "btnSpinStartingPlayer"
        );


    const players =
        obtenerJugadoresStartingPlayer();


    button.disabled =
        players.length === 0;

}

function renderScoreMatrix() {

    const tbody =
        document.querySelector(
            "#scoreMatrixTable tbody"
        );


    tbody.innerHTML =
        "";


    scoreMatrix.forEach(
        (
            row,
            rowIndex
        ) => {

            const tr =
                document.createElement(
                    "tr"
                );


            row.forEach(
                (
                    value,
                    columnIndex
                ) => {

                    const td =
                        document.createElement(
                            "td"
                        );


                    const isHeader =
                        rowIndex === 0;


                    const isPlayerColumn =
                        columnIndex === 0;


                    const isTotalColumn =
                        columnIndex ===
                        row.length - 1;


                    /*
                     * SUMA FINAL
                     */

                    if (
                        isTotalColumn
                    ) {

                        if (
                            isHeader
                        ) {

                            const header =
                                document.createElement(
                                    "div"
                                );


                            header.className =
                                "score-matrix-total-header";


                            header.textContent =
                                "SUMA FINAL";


                            td.appendChild(
                                header
                            );

                        }
                        else {

                            const total =
                    document.createElement(
                        "div"
                    );


                total.className =
                    "score-matrix-total";


                const suma =
                    calcularSumaFila(
                        row
                    );


                const sumaGanadora =
                    obtenerSumaGanadora();


                total.textContent =
                    suma;


                if (
                    sumaGanadora !== null
                    &&
                    sumaGanadora !== 0
                    &&
                    suma === sumaGanadora
                ) {

                    const crown =
                        document.createElement(
                            "span"
                        );


                    crown.className =
                        "score-matrix-crown";


                    crown.textContent =
                        "👑";


                    crown.title =
                        "Puntuación más alta";


                    total.appendChild(
                        crown
                    );

                }


                            td.appendChild(
                                total
                            );

                        }


                        tr.appendChild(
                            td
                        );


                        return;

                    }


                    /*
                     * Celdas editables.
                     */

                    const input =
                        document.createElement(
                            "input"
                        );


                    input.type =
                        isPlayerColumn
                        ||
                        isHeader
                            ? "text"
                            : "number";


                    input.value =
                        value;


                    if (
                        isHeader
                    ) {

                        input.classList.add(
                            "score-matrix-header-input"
                        );

                    }


                    if (
                        isPlayerColumn
                    ) {

                        input.classList.add(
                            "score-matrix-player-input"
                        );

                    }


                    input.addEventListener(
                        "input",
                        function () {

                            scoreMatrix[
                                rowIndex
                            ][
                                columnIndex
                            ] =
                                input.value;


                            if (
                                !isHeader
                                &&
                                !isPlayerColumn
                            ) {

                                actualizarSumasScore();

                            }

                        }
                    );


                    td.appendChild(
                        input
                    );


                    tr.appendChild(
                        td
                    );

                }
            );


            tbody.appendChild(
                tr
            );

        }
    );

}

function agregarFilaScore() {

    const columns =
        scoreMatrix[0].length;


    const newRow =
        new Array(
            columns
        ).fill(
            ""
        );


    newRow[0] =
        `Jugador ${scoreMatrix.length}`;


    scoreMatrix.push(
        newRow
    );


    renderScoreMatrix();

}

function EliminarFilaScore() {

    if (    
        scoreMatrix.length <= 1
    ) {

        return;

    }


    scoreMatrix.pop();


    renderScoreMatrix();

}

function eliminarColumnaScore() {

    if (
        scoreMatrix[0].length <= 2
    ) {

        return;

    }


    scoreMatrix.forEach(
        (
            row,
            rowIndex
        ) => {

            row.pop();

        }
    );


    renderScoreMatrix();

}

function agregarColumnaScore() {

    const totalColumnIndex =
        scoreMatrix[0].length - 1;


    const newColumnNumber =
        totalColumnIndex;


    scoreMatrix.forEach(
        (
            row,
            rowIndex
        ) => {

            const value =
                rowIndex === 0
                    ? `Rubro ${newColumnNumber}`
                    : "";


            row.splice(
                totalColumnIndex,
                0,
                value
            );

        }
    );


    renderScoreMatrix();

}

function limpiarScoreMatrix() {

    scoreMatrix = [
        [
            "Nombre Jugador",
            "Rubro 1",
            "SUMA FINAL"
        ],
        [
            "Jugador 1",
            "",
            ""
        ]
    ];


    renderScoreMatrix();

}

function abrirScoreMatrix() {

    const modal =
        document.getElementById(
            "scoreMatrixModal"
        );


    renderScoreMatrix();


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


function cerrarScoreMatrix() {

    document.getElementById(
        "scoreMatrixModal"
    ).hidden =
        true;


    document.body.style.overflow =
        "";

}

function calcularSumaFila(
    row
) {

    let total =
        0;


    /*
     * Empezamos en 1 porque
     * la primera columna es
     * el nombre del jugador.
     *
     * Terminamos antes de la última,
     * porque esa es SUMA FINAL.
     */

    for (
        let columnIndex = 1;
        columnIndex < row.length - 1;
        columnIndex++
    ) {

        const value =
            Number(
                row[
                    columnIndex
                ]
            );


        if (
            Number.isFinite(
                value
            )
        ) {

            total +=
                value;

        }

    }


    return total;

}

function actualizarSumasScore() {

    const table =
        document.getElementById(
            "scoreMatrixTable"
        );


    const sumaGanadora =
        obtenerSumaGanadora();


    for (
        let rowIndex = 1;
        rowIndex < scoreMatrix.length;
        rowIndex++
    ) {

        const tableRow =
            table.rows[
                rowIndex
            ];


        if (!tableRow) {

            continue;

        }


        const totalCell =
            tableRow.cells[
                tableRow.cells.length - 1
            ];


        const totalElement =
            totalCell.querySelector(
                ".score-matrix-total"
            );


        if (!totalElement) {

            continue;

        }


        const suma =
            calcularSumaFila(
                scoreMatrix[
                    rowIndex
                ]
            );


        totalElement.innerHTML =
            "";


        const number =
            document.createElement(
                "span"
            );


        number.textContent =
            suma;


        totalElement.appendChild(
            number
        );


        if (
            sumaGanadora !== null
            &&
            suma === sumaGanadora
        ) {

            const crown =
                document.createElement(
                    "span"
                );


            crown.className =
                "score-matrix-crown";


            crown.textContent =
                "👑";


            crown.title =
                "Puntuación más alta";


            totalElement.appendChild(
                crown
            );

        }

    }

}

function obtenerSumaGanadora() {

    if (
        scoreMatrix.length <= 1
    ) {

        return null;

    }


    const totales =
        scoreMatrix
            .slice(1)
            .map(
                row =>
                    calcularSumaFila(
                        row
                    )
            );


    if (
        totales.length === 0
    ) {

        return null;

    }


    return Math.max(
        ...totales
    );

}