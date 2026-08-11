import {
    supabase
} from "../config/supabase.js";

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

/*CARGAR JUEGOS DE LA COLECCIÓN*/
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
                image_url,
                playingtime
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

function generarCodigoColeccion() {

    const grupos = [];


    for (
        let grupo = 0;
        grupo < 4;
        grupo++
    ) {

        const numeros =
            new Uint32Array(
                4
            );


        crypto.getRandomValues(
            numeros
        );


        let bloque = "";


        for (
            const numero
            of numeros
        ) {

            bloque +=
                String(
                    numero % 10
                );

        }


        grupos.push(
            bloque
        );

    }


    return grupos.join(
        "-"
    );

}

export async function crearColeccionAutomatica() {

    const maxIntentos =
        10;


    for (
        let intento = 0;
        intento < maxIntentos;
        intento++
    ) {

        const codigo =
            generarCodigoColeccion();


        const {
            data,
            error
        } = await supabase
            .from(
                "codigos_coleccion"
            )
            .insert({
                codigo
            })
            .select(
                "id, codigo"
            )
            .single();


        if (!error) {

            return data;

        }


        /*
         * 23505 =
         * unique violation.
         *
         * Si por una coincidencia
         * extraordinaria ya existe,
         * generamos otro.
         */

        if (
            error.code === "23505"
        ) {

            continue;

        }


        throw new Error(
            `Error creando colección: ${error.message}`
        );

    }


    throw new Error(
        "No fue posible generar un código de colección."
    );

}