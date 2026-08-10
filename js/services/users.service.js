import {
    supabase
} from "../config/supabase.js";


export async function obtenerUsuariosColeccion(
    collectionId
) {

    const {
        data,
        error
    } = await supabase
        .from("usuarios_coleccion")
        .select(
            "id, apodo, fecha_creacion"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        )
        .order(
            "apodo",
            {
                ascending: true
            }
        );


    if (error) {

        throw new Error(
            `Error obteniendo usuarios: ${error.message}`
        );

    }


    return data ?? [];

}


export async function crearUsuarioColeccion(
    collectionId,
    nickname
) {

    const apodo =
        normalizarApodo(
            nickname
        );


    if (!apodo) {

        throw new Error(
            "El apodo no puede estar vacío."
        );

    }


    const {
        data: existente,
        error: errorBusqueda
    } = await supabase
        .from("usuarios_coleccion")
        .select(
            "id, apodo"
        )
        .eq(
            "id_codigo_coleccion",
            collectionId
        )
        .ilike(
            "apodo",
            apodo
        )
        .maybeSingle();


    if (errorBusqueda) {

        throw new Error(
            `Error comprobando el apodo: ${errorBusqueda.message}`
        );

    }


    if (existente) {

        throw new Error(
            "Ese apodo ya existe en la colección."
        );

    }


    const {
        data,
        error
    } = await supabase
        .from("usuarios_coleccion")
        .insert({
            id_codigo_coleccion:
                collectionId,

            apodo
        })
        .select(
            "id, apodo"
        )
        .single();


    if (error) {

        if (
            error.code === "23505"
        ) {

            throw new Error(
                "Ese apodo ya existe en la colección."
            );

        }


        throw new Error(
            `Error creando usuario: ${error.message}`
        );

    }


    return data;

}


function normalizarApodo(
    nickname
) {

    return String(
        nickname ?? ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .slice(
            0,
            50
        );

}