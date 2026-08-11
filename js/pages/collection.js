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

let visibleGames = [];

let luckyRunning = false;

let currentImageGame =
    null;

let activeQuickFilter =
    null;

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

            iniciarFeelingLucky();

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

        console.error(
            error
        );


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

            console.log(
                "ENTRÓ A SCORE"
            );

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


            console.table(
                result.slice(
                    0,
                    20
                ).map(
                    game => ({
                        juego:
                            game.objectname,

                        score:
                            game.score,

                        peso:
                            game.avgweight
                    })
                )
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


        console.log(
            `${game.objectname}: ${result.reaccion}`
        );

    }
    catch (
        error
    ) {

        console.error(
            "Error actualizando reacción:",
            error
        );


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


    iniciarFeelingLucky();

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

    return [...visibleGames]
        .sort(
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


                /*
                 * En empate usamos
                 * my_rating como
                 * desempate.
                 */

                return (
                    numeroSeguro(
                        b.my_rating,
                        0
                    ) -
                    numeroSeguro(
                        a.my_rating,
                        0
                    )
                );

            }
        )
        .slice(
            0,
            15
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

async function iniciarFeelingLucky() {

    if (
        luckyRunning
    ) {

        return;

    }


    const candidates =
        obtenerCandidatosFeelingLucky();


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

        console.error(
            error
        );


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