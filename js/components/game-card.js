export function crearGameCard(
    game
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "game-card";


    card.dataset.gameId =
        game.id;


    card.dataset.objectid =
        game.objectid;


    const originalName =
        obtenerNombreOriginal(
            game
        );


    card.innerHTML = `

        <header class="game-card-header">

            <h2 class="game-title">

                <a
                    class="game-title-link"
                    href="https://boardgamegeek.com/boardgame/${escapeAttribute(
                        game.objectid
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver ${escapeAttribute(
                        game.objectname
                    )} en BoardGameGeek">

                    ${escapeHTML(
                        game.objectname
                    )}

                    <span class="external-link-icon">
                        ↗
                    </span>

                </a>

            </h2>

            <p class="game-original-name">
                ${escapeHTML(originalName)}
            </p>

        </header>


        <div class="game-image-container">

            ${crearImagen(game)}

            <div class="game-playing-time">

                ⏱️
                ${formatearPlayingTime(
                    game.playingtime
                )}

            </div>

            <div class="
                game-rating
                ${obtenerClaseRating(game.my_rating)}
            ">

                ${formatearRating(game.my_rating)}

            </div>


            <div
                class="game-reaction-counts"
                data-reaction-counts>

                <span
                    title="Odiar"
                    data-count-reaction="ODIAR">

                    💀
                    ${obtenerConteo(
                        game,
                        "ODIAR"
                    )}

                </span>

                <span
                    title="No me gusta"
                    data-count-reaction="DISLIKE">

                    👎
                    ${obtenerConteo(
                        game,
                        "DISLIKE"
                    )}

                </span>

                <span
                    title="No jugado"
                    data-count-reaction="NO_JUGADO">

                    ❔
                    ${obtenerConteo(
                        game,
                        "NO_JUGADO"
                    )}

                </span>

                <span
                    title="Me gusta"
                    data-count-reaction="LIKE">

                    👍
                    ${obtenerConteo(
                        game,
                        "LIKE"
                    )}

                </span>

                <span
                    title="Favorito"
                    data-count-reaction="FAVORITO">

                    ⭐
                    ${obtenerConteo(
                        game,
                        "FAVORITO"
                    )}

                </span>

            </div>

        </div>

        <div class="game-score">

            <span>
                Score
            </span>

            <strong
                data-game-score
                class="${obtenerClaseScore(game.score)}">

                ${formatearScore(
                    game.score
                )}

            </strong>

        </div>

        <div class="game-actions">

            <button
                type="button"
                class="
                    reaction-button
                    ${obtenerClaseReaccion(
                        game.reaccion,
                        "ODIAR"
                    )}
                "
                data-reaction="ODIAR"
                title="Odiar"
                aria-pressed="${
                    game.reaccion === "ODIAR"
                }">
                💀
            </button>


            <button
                type="button"
                class="
                    reaction-button
                    ${obtenerClaseReaccion(
                        game.reaccion,
                        "DISLIKE"
                    )}
                "
                data-reaction="DISLIKE"
                title="No me gusta"
                aria-pressed="${
                    game.reaccion === "DISLIKE"
                }">
                👎
            </button>


            <button
                type="button"
                class="
                    reaction-button
                    ${obtenerClaseReaccion(
                        game.reaccion,
                        "NO_JUGADO"
                    )}
                "
                data-reaction="NO_JUGADO"
                title="No jugado"
                aria-pressed="${
                    game.reaccion === "NO_JUGADO"
                }">
                ❔
            </button>


            <button
                type="button"
                class="
                    reaction-button
                    ${obtenerClaseReaccion(
                        game.reaccion,
                        "LIKE"
                    )}
                "
                data-reaction="LIKE"
                title="Me gusta"
                aria-pressed="${
                    game.reaccion === "LIKE"
                }">
                👍
            </button>


            <button
                type="button"
                class="
                    reaction-button
                    ${obtenerClaseReaccion(
                        game.reaccion,
                        "FAVORITO"
                    )}
                "
                data-reaction="FAVORITO"
                title="Favorito"
                aria-pressed="${
                    game.reaccion === "FAVORITO"
                }">
                ⭐
            </button>

        </div>

        <div
            class="reaction-detail"
            data-reaction-detail
            hidden>
        </div>


        <footer class="game-card-footer">

            <span
                class="game-type"
                title="${escapeHTML(
                    game.itemtype ?? "-"
                )}">

                ${escapeHTML(
                    formatearTipo(
                        game.itemtype
                    )
                )}

            </span>


            <span
                class="game-weight"
                title="Peso">

                ⚖️
                ${formatearPeso(
                    game.avgweight
                )}

            </span>


            <span
                class="game-players"
                title="Jugadores">

                👥
                ${formatearJugadores(
                    game.minplayers,
                    game.maxplayers
                )}

            </span>

        </footer>

    `;


    return card;

}


function crearImagen(
    game
) {

    const imageUrl =
        String(
            game.image_url ?? ""
        )
            .trim();


    if (!imageUrl) {

        return crearPlaceholder(
            game
        );

    }


    return `

        <img
            class="game-image"
            src="${escapeAttribute(imageUrl)}"
            alt="${escapeAttribute(game.objectname)}"
            loading="lazy"
            data-game-image>

    `;

}


function crearPlaceholder(
    game
) {

    return `

        <div
            class="game-image-placeholder"
            data-add-image
            data-game-id="${escapeAttribute(
                game.id
            )}"
            role="button"
            tabindex="0"
            title="Añadir link de imagen">

            <span class="placeholder-dice">
                🎲
            </span>


            <small>
                Imagen pendiente
            </small>


            <span class="">
                + Añadir link de imagen
            </span>

        </div>

    `;

}


function obtenerNombreOriginal(
    game
) {

    const original =
        String(
            game.originalname ?? ""
        )
            .trim();


    if (
        !original ||
        original.toLowerCase() ===
        String(
            game.objectname
        ).trim().toLowerCase()
    ) {

        return "";

    }


    return `(${original})`;

}


function obtenerClaseRating(
    rating
) {

    const value =
        Number(
            rating
        );


    if (
        rating === null ||
        rating === undefined ||
        !Number.isFinite(
            value
        )
    ) {

        return "rating-none";

    }


    if (
        value < 6
    ) {

        return "rating-low";

    }


    if (
        value < 8
    ) {

        return "rating-medium";

    }


    return "rating-high";

}


function formatearRating(
    rating
) {

    if (
        rating === null ||
        rating === undefined
    ) {

        return "-";

    }


    const number =
        Number(
            rating
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "-";

    }


    return Number.isInteger(
        number
    )
        ? String(number)
        : number.toFixed(1);

}


function formatearPeso(
    weight
) {

    const number =
        Number(
            weight
        );


    if (
        weight === null ||
        weight === undefined ||
        !Number.isFinite(
            number
        )
    ) {

        return "-";

    }


    return number.toFixed(1);

}


function formatearJugadores(
    min,
    max
) {

    if (
        min === null &&
        max === null
    ) {

        return "-";

    }


    if (
        min === max
    ) {

        return String(
            min
        );

    }


    return `${min ?? "?"} – ${max ?? "?"}`;

}


function formatearTipo(
    type
) {

    switch (
        String(
            type ?? ""
        ).toLowerCase()
    ) {

        case "boardgame":

            return "Juego";


        case "boardgameexpansion":

            return "Expansión";


        default:

            return type || "-";

    }

}


function obtenerClaseReaccion(
    currentReaction,
    reaction
) {

    return currentReaction === reaction
        ? "active"
        : "";

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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


function obtenerConteo(
    game,
    reaction
) {

    return (
        game.reactionCounts
        ?.[reaction]
        ?? 0
    );

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


    if (
        value > 0
    ) {

        return `+${value}`;

    }


    return String(
        value
    );

}

function obtenerClaseScore(
    score
) {

    const value =
        Number(
            score
        );


    if (
        value > 0
    ) {

        return "score-positive";

    }


    if (
        value < 0
    ) {

        return "score-negative";

    }


    return "score-neutral";

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

        return "-";

    }


    if (
        minutes < 60
    ) {

        return `${minutes} min`;

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

        return `${hours} h`;

    }


    return `${hours} h ${remainingMinutes} min`;

}

/**/ 