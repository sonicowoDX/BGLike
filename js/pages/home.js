import {
    supabase
} from "../config/supabase.js";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "BGLike iniciado correctamente."
        );

        inicializarHome();

        probarConexionSupabase();

    }
);


function inicializarHome() {

    const inputCollectionCode =
        document.getElementById(
            "collectionCode"
        );

    const btnImportCollection =
        document.getElementById(
            "btnImportCollection"
        );

    const btnJoinCollection =
        document.getElementById(
            "btnJoinCollection"
        );


    btnImportCollection.addEventListener(
        "click",
        function () {

            const codigo =
                obtenerCodigoColeccion(
                    inputCollectionCode
                );

            if (!codigo) {
                return;
            }


            window.location.href =
                `./pages/importar.html?codigo=${encodeURIComponent(codigo)}`;

        }
    );


    btnJoinCollection.addEventListener(
        "click",
        function () {

            const codigo =
                obtenerCodigoColeccion(
                    inputCollectionCode
                );

            if (!codigo) {
                return;
            }


            window.location.href =
                `./pages/unirse.html?codigo=${encodeURIComponent(codigo)}`;

        }
    );


    inputCollectionCode.addEventListener(
        "input",
        function () {

            limpiarErrorCodigo();

            inputCollectionCode.value =
                normalizarCodigo(
                    inputCollectionCode.value
                );

        }
    );


    inputCollectionCode.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                btnJoinCollection.click();

            }

        }
    );

}


function obtenerCodigoColeccion(
    input
) {

    const codigo =
        normalizarCodigo(
            input.value
        );


    if (!codigo) {

        mostrarErrorCodigo(
            "Ingresa un código de colección."
        );

        input.focus();

        return null;

    }


    if (codigo.length < 3) {

        mostrarErrorCodigo(
            "El código debe tener al menos 3 caracteres."
        );

        input.focus();

        return null;

    }


    input.value =
        codigo;


    return codigo;

}


function normalizarCodigo(
    codigo
) {

    return codigo
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "-")
        .replace(
            /[^A-Z0-9-_]/g,
            ""
        );

}


function mostrarErrorCodigo(
    mensaje
) {

    const input =
        document.getElementById(
            "collectionCode"
        );

    const error =
        document.getElementById(
            "collectionCodeError"
        );


    input.classList.add(
        "input-error"
    );

    error.textContent =
        mensaje;

}


function limpiarErrorCodigo() {

    const input =
        document.getElementById(
            "collectionCode"
        );

    const error =
        document.getElementById(
            "collectionCodeError"
        );


    input.classList.remove(
        "input-error"
    );

    error.textContent =
        "";

}


async function probarConexionSupabase() {

    const {
        error
    } = await supabase
        .from("codigos_coleccion")
        .select("id")
        .limit(1);


    if (error) {

        console.error(
            "Error al conectar con Supabase:",
            error
        );

        return;

    }


    console.log(
        "Conexión con Supabase correcta."
    );

}