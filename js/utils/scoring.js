export const REACTION_SCORES = {
    ODIAR: -2,
    DISLIKE: -1,
    NO_JUGADO: 0,
    LIKE: 1,
    FAVORITO: 2
};


export function calcularMetricasJuego(
    reactions
) {

    const counts = {
        ODIAR: 0,
        DISLIKE: 0,
        NO_JUGADO: 0,
        LIKE: 0,
        FAVORITO: 0
    };


    let score = 0;


    for (
        const reaction of reactions
    ) {

        const type =
            reaction.reaccion;


        if (
            !(type in counts)
        ) {

            continue;

        }


        counts[type]++;


        score +=
            REACTION_SCORES[type];

    }


    return {
        counts,
        score
    };

}