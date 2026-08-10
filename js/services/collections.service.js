import {
    supabase
} from "../config/supabase.js";


export async function obtenerOCrearColeccion(
    codigo
) {

    const codigoNormalizado =
        codigo
            .trim()
            .toUpperCase();


    const {
        data: coleccionExistente,
        error: errorConsulta
    } = await supabase
        .from("codigos_coleccion")
        .select(
            "id, codigo"
        )
        .eq(
            "codigo",
            codigoNormalizado
        )
        .maybeSingle();


    if (errorConsulta) {

        throw new Error(
            `Error buscando colección: ${errorConsulta.message}`
        );

    }


    if (coleccionExistente) {

        return {
            collection:
                coleccionExistente,

            created:
                false
        };

    }


    const {
        data: nuevaColeccion,
        error: errorInsert
    } = await supabase
        .from("codigos_coleccion")
        .insert({
            codigo:
                codigoNormalizado
        })
        .select(
            "id, codigo"
        )
        .single();


    if (errorInsert) {

        throw new Error(
            `Error creando colección: ${errorInsert.message}`
        );

    }


    return {
        collection:
            nuevaColeccion,

        created:
            true
    };

}


export async function sincronizarJuegosColeccion(
    collectionId,
    importedGames,
    juegosRegistrados
) {

    const juegosPorObjectId =
        new Map();


    for (
        const juego of juegosRegistrados
    ) {

        juegosPorObjectId.set(
            Number(
                juego.objectid
            ),
            juego
        );

    }


    const relaciones = [];


    for (
        const importedGame
        of importedGames
    ) {

        const juegoRegistrado =
            juegosPorObjectId.get(
                Number(
                    importedGame.objectid
                )
            );


        if (!juegoRegistrado) {

            console.warn(
                "No se encontró el juego:",
                importedGame.objectid
            );

            continue;

        }


        relaciones.push({
            id_codigo_coleccion:
                collectionId,

            id_juego:
                juegoRegistrado.id,

            my_rating:
                importedGame.my_rating
        });

    }


    if (
        relaciones.length === 0
    ) {

        throw new Error(
            "No fue posible relacionar los juegos con la colección."
        );

    }


    const {
        error: errorUpsert
    } = await supabase
        .from("coleccion")
        .upsert(
            relaciones,
            {
                onConflict:
                    "id_codigo_coleccion,id_juego"
            }
        );


    if (errorUpsert) {

        throw new Error(
            `Error actualizando colección: ${errorUpsert.message}`
        );

    }


    await eliminarJuegosAusentes(
        collectionId,
        relaciones
    );


    await actualizarFechaColeccion(
        collectionId
    );


    return relaciones.length;

}


async function eliminarJuegosAusentes(
    collectionId,
    relacionesActuales
) {

    const {
        data: relacionesExistentes,
        error
    } = await supabase
        .from("coleccion")
        .select(
            "id, id_juego"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (error) {

        throw new Error(
            `Error consultando la colección actual: ${error.message}`
        );

    }


    const idsActuales =
        new Set(
            relacionesActuales.map(
                item =>
                    Number(
                        item.id_juego
                    )
            )
        );


    const relacionesEliminar =
        (relacionesExistentes ?? [])
            .filter(
                relation =>
                    !idsActuales.has(
                        Number(
                            relation.id_juego
                        )
                    )
            )
            .map(
                relation =>
                    relation.id
            );


    if (
        relacionesEliminar.length === 0
    ) {

        return;

    }


    const {
        error: errorDelete
    } = await supabase
        .from("coleccion")
        .delete()
        .in(
            "id",
            relacionesEliminar
        );


    if (errorDelete) {

        throw new Error(
            `Error eliminando juegos anteriores: ${errorDelete.message}`
        );

    }

}


async function actualizarFechaColeccion(
    collectionId
) {

    const {
        error
    } = await supabase
        .from("codigos_coleccion")
        .update({
            fecha_actualizacion:
                new Date().toISOString()
        })
        .eq(
            "id",
            collectionId
        );


    if (error) {

        console.warn(
            "No se pudo actualizar la fecha de colección:",
            error
        );

    }

}

export async function obtenerColeccionPorCodigo(
    codigo
) {

    const codigoNormalizado =
        String(
            codigo ?? ""
        )
            .trim()
            .toUpperCase();


    const {
        data,
        error
    } = await supabase
        .from("codigos_coleccion")
        .select(
            "id, codigo"
        )
        .eq(
            "codigo",
            codigoNormalizado
        )
        .maybeSingle();


    if (error) {

        throw new Error(
            `Error buscando colección: ${error.message}`
        );

    }


    return data;

}

export async function obtenerJuegosColeccion(
    collectionId
) {

    const {
        data,
        error
    } = await supabase
        .from("coleccion")
        .select(`
            id,
            my_rating,
            juegos (
                id,
                objectid,
                objectname,
                originalname,
                avgweight,
                itemtype,
                minplayers,
                maxplayers,
                image_url
            )
        `)
        .eq(
            "id_codigo_coleccion",
            collectionId
        );


    if (error) {

        throw new Error(
            `Error obteniendo la colección: ${error.message}`
        );

    }


    return (
        data ?? []
    )
        .filter(
            item =>
                item.juegos
        )
        .map(
            item => ({
                collection_game_id:
                    item.id,

                my_rating:
                    item.my_rating,

                ...item.juegos
            })
        );

}