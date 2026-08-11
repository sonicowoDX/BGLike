import {
    supabase
} from "../config/supabase.js";


const QUERY_CHUNK_SIZE = 100;


export async function guardarJuegosNuevos(
    games
) {

    const juegos =
        games.map(
            game => ({
                objectid: game.objectid,
                objectname: game.objectname,
                originalname: game.originalname,
                avgweight: game.avgweight,
                itemtype: game.itemtype,
                minplayers: game.minplayers,
                maxplayers: game.maxplayers,
                playingtime:game.playingtime
            })
        );


    const chunks =
        dividirArreglo(
            juegos,
            QUERY_CHUNK_SIZE
        );


    for (
        const chunk of chunks
    ) {

        const {
            error
        } = await supabase
            .from("juegos")
            .upsert(
                chunk,
                {
                    onConflict: "objectid",
                    ignoreDuplicates: true
                }
            );


        if (error) {

            throw new Error(
                `Error guardando juegos: ${error.message}`
            );

        }

    }

}


export async function obtenerJuegosPorObjectIds(
    objectIds
) {

    const resultados = [];


    const chunks =
        dividirArreglo(
            objectIds,
            QUERY_CHUNK_SIZE
        );


    for (
        const chunk of chunks
    ) {

        const {
            data,
            error
        } = await supabase
            .from("juegos")
            .select(
                "id, objectid"
            )
            .in(
                "objectid",
                chunk
            );


        if (error) {

            throw new Error(
                `Error consultando juegos: ${error.message}`
            );

        }


        resultados.push(
            ...(data ?? [])
        );

    }


    return resultados;

}


function dividirArreglo(
    array,
    size
) {

    const chunks = [];


    for (
        let i = 0;
        i < array.length;
        i += size
    ) {

        chunks.push(
            array.slice(
                i,
                i + size
            )
        );

    }


    return chunks;

}

export async function actualizarImagenJuego(
    gameId,
    imageUrl
) {

    const {
        data,
        error
    } = await supabase
        .from("juegos")
        .update({
            image_url:
                imageUrl
        })
        .eq(
            "id",
            gameId
        )
        .select(
            "id, objectid, image_url"
        )
        .single();


    if (error) {

        throw new Error(
            `Error actualizando la imagen: ${error.message}`
        );

    }


    return data;

}