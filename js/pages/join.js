import {
    obtenerColeccionPorCodigo
} from "../services/collections.service.js";


import {
    obtenerUsuariosColeccion,
    crearUsuarioColeccion
} from "../services/users.service.js";


import {
    crearReaccionesInicialesUsuario
} from "../services/reactions.service.js";


let currentCollection = null;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        initializeCreateUser();

        await cargarColeccion();

    }
);


async function cargarColeccion() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const code =
        params.get(
            "codigo"
        )
            ?.trim()
            ?.toUpperCase();


    if (!code) {

        window.location.href =
            "../index.html";

        return;

    }


    document.getElementById(
        "collectionCode"
    ).textContent = code;


    try {

        currentCollection =
            await obtenerColeccionPorCodigo(
                code
            );


        if (!currentCollection) {

            showMessage(
                "La colección indicada no existe.",
                "error"
            );

            return;

        }


        await cargarUsuarios();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        showMessage(
            error.message,
            "error"
        );

    }

}


async function cargarUsuarios() {

    const users =
        await obtenerUsuariosColeccion(
            currentCollection.id
        );


    renderUsuarios(
        users
    );


    document.getElementById(
        "usersSection"
    ).hidden = false;

}


function renderUsuarios(
    users
) {

    const list =
        document.getElementById(
            "usersList"
        );

    const empty =
        document.getElementById(
            "emptyUsers"
        );


    list.innerHTML =
        "";


    if (
        users.length === 0
    ) {

        empty.hidden =
            false;

        return;

    }


    empty.hidden =
        true;


    for (
        const user of users
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "user-button";


        button.textContent =
            `🎲 ${user.apodo}`;


        button.addEventListener(
            "click",
            function () {

                seleccionarUsuario(
                    user
                );

            }
        );


        list.appendChild(
            button
        );

    }

}


function initializeCreateUser() {

    const showButton =
        document.getElementById(
            "btnShowCreateUser"
        );

    const form =
        document.getElementById(
            "createUserForm"
        );

    const nickname =
        document.getElementById(
            "nickname"
        );


    showButton.addEventListener(
        "click",
        function () {

            form.hidden =
                !form.hidden;


            if (
                !form.hidden
            ) {

                nickname.focus();

            }

        }
    );


    form.addEventListener(
        "submit",
        async function (
            event
        ) {

            event.preventDefault();

            await crearNuevoUsuario();

        }
    );

}


async function crearNuevoUsuario() {

    if (!currentCollection) {

        return;

    }


    const nicknameInput =
        document.getElementById(
            "nickname"
        );

    const errorElement =
        document.getElementById(
            "nicknameError"
        );

    const createButton =
        document.getElementById(
            "btnCreateUser"
        );


    const nickname =
        nicknameInput.value
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    errorElement.textContent =
        "";


    if (
        nickname.length < 2
    ) {

        errorElement.textContent =
            "El apodo debe tener al menos 2 caracteres.";

        nicknameInput.focus();

        return;

    }


    const originalText =
        createButton.textContent;


    try {

        createButton.disabled =
            true;


        createButton.textContent =
            "Creando...";


        const user =
            await crearUsuarioColeccion(
                currentCollection.id,
                nickname
            );


        await crearReaccionesInicialesUsuario(
            currentCollection.id,
            user.id
        );


        seleccionarUsuario(
            user
        );

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

        createButton.disabled =
            false;


        createButton.textContent =
            originalText;

    }

}


function seleccionarUsuario(
    user
) {

    localStorage.setItem(
        "bglike_collection_id",
        String(
            currentCollection.id
        )
    );


    localStorage.setItem(
        "bglike_collection_code",
        currentCollection.codigo
    );


    localStorage.setItem(
        "bglike_user_id",
        String(
            user.id
        )
    );


    localStorage.setItem(
        "bglike_user_nickname",
        user.apodo
    );


    window.location.href =
        "../pages/coleccion.html";

}


function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "joinMessage"
        );


    element.className =
        `import-message ${type}`;


    element.textContent =
        message;


    element.hidden =
        false;

}