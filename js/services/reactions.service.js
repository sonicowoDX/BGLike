import {
    supabase
} from "../config/supabase.js";


const INSERT_CHUNK_SIZE = 500;


export async function crearReaccionesInicialesUsuario(
    collectionId,
    userId
) {

    const {
        data: juegosColeccion,
        error
    } = await supabase
        .from("coleccion")
        .select(
            "id_juego"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (error) {

        throw new Error(
            `Error obteniendo juegos de la colección: ${error.message}`
        );

    }


    const reactions =
        (juegosColeccion ?? [])
            .map(
                item => ({
                    id_usuario:
                        userId,

                    id_juego:
                        item.id_juego,

                    reaccion:
                        "NO_JUGADO"
                })
            );


    await insertarReacciones(
        reactions
    );

}


export async function crearReaccionesFaltantesColeccion(
    collectionId
) {

    const {
        data: users,
        error: errorUsers
    } = await supabase
        .from("usuarios_coleccion")
        .select(
            "id"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (errorUsers) {

        throw new Error(
            `Error obteniendo usuarios: ${errorUsers.message}`
        );

    }


    if (
        !users ||
        users.length === 0
    ) {

        return;

    }


    const {
        data: games,
        error: errorGames
    } = await supabase
        .from("coleccion")
        .select(
            "id_juego"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (errorGames) {

        throw new Error(
            `Error obteniendo juegos: ${errorGames.message}`
        );

    }


    if (
        !games ||
        games.length === 0
    ) {

        return;

    }


    const reactions = [];


    for (
        const user of users
    ) {

        for (
            const game of games
        ) {

            reactions.push({
                id_usuario:
                    user.id,

                id_juego:
                    game.id_juego,

                reaccion:
                    "NO_JUGADO"
            });

        }

    }


    await insertarReacciones(
        reactions
    );

}


async function insertarReacciones(
    reactions
) {

    if (
        reactions.length === 0
    ) {

        return;

    }


    for (
        let i = 0;
        i < reactions.length;
        i += INSERT_CHUNK_SIZE
    ) {

        const chunk =
            reactions.slice(
                i,
                i + INSERT_CHUNK_SIZE
            );


        const {
            error
        } = await supabase
            .from("reacciones")
            .upsert(
                chunk,
                {
                    onConflict:
                        "id_usuario,id_juego",

                    ignoreDuplicates:
                        true
                }
            );


        if (error) {

            throw new Error(
                `Error creando reacciones: ${error.message}`
            );

        }

    }

}

export async function obtenerReaccionesUsuario(
    userId
) {

    const {
        data,
        error
    } = await supabase
        .from("reacciones")
        .select(
            "id, id_juego, reaccion"
        )
        .eq(
            "id_usuario",
            userId
        );


    if (error) {

        throw new Error(
            `Error obteniendo reacciones: ${error.message}`
        );

    }


    return data ?? [];

}


export async function actualizarReaccion(
    userId,
    gameId,
    reaction
) {

    const validReactions = [
        "ODIAR",
        "DISLIKE",
        "NO_JUGADO",
        "LIKE",
        "FAVORITO"
    ];


    if (
        !validReactions.includes(
            reaction
        )
    ) {

        throw new Error(
            "La reacción seleccionada no es válida."
        );

    }


    const {
        data,
        error
    } = await supabase
        .from("reacciones")
        .upsert(
            {
                id_usuario:
                    userId,

                id_juego:
                    gameId,

                reaccion:
                    reaction,

                fecha_actualizacion:
                    new Date().toISOString()
            },
            {
                onConflict:
                    "id_usuario,id_juego"
            }
        )
        .select(
            "id, id_usuario, id_juego, reaccion"
        )
        .single();


    if (error) {

        throw new Error(
            `Error actualizando reacción: ${error.message}`
        );

    }


    return data;

}


export async function obtenerReaccionesColeccion(
    collectionId
) {

    const {
        data: users,
        error: usersError
    } = await supabase
        .from("usuarios_coleccion")
        .select("id")
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (usersError) {

        throw new Error(
            `Error obteniendo usuarios: ${usersError.message}`
        );

    }


    if (
        !users ||
        users.length === 0
    ) {

        return [];

    }


    const userIds =
        users.map(
            user =>
                user.id
        );


    const allReactions = [];


    /*
     * Supabase normalmente limita
     * las consultas a 1000 filas.
     *
     * Por eso paginamos las
     * reacciones.
     */

    const pageSize =
        1000;


    let from =
        0;


    while (
        true
    ) {

        const to =
            from +
            pageSize -
            1;


        const {
            data,
            error
        } = await supabase
            .from("reacciones")
            .select(
                "id, id_usuario, id_juego, reaccion"
            )
            .in(
                "id_usuario",
                userIds
            )
            .order(
                "id",
                {
                    ascending: true
                }
            )
            .range(
                from,
                to
            );


        if (error) {

            throw new Error(
                `Error obteniendo reacciones de la colección: ${error.message}`
            );

        }


        const reactions =
            data ?? [];


        allReactions.push(
            ...reactions
        );


        /*
         * Si recibimos menos de 1000,
         * llegamos a la última página.
         */

        if (
            reactions.length <
            pageSize
        ) {

            break;

        }


        from +=
            pageSize;

    }


    return allReactions;

}