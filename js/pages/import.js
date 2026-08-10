import {
    parseBGGCSV
} from "../utils/csv.js";

import {
    guardarJuegosNuevos,
    obtenerJuegosPorObjectIds
} from "../services/games.service.js";


import {
    obtenerOCrearColeccion,
    sincronizarJuegosColeccion
} from "../services/collections.service.js";


import {
    crearReaccionesFaltantesColeccion
} from "../services/reactions.service.js";


let importedGames = [];


document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeImportPage();

    }
);


function initializeImportPage() {

    loadCollectionCode();

    initializeFileInput();

    initializeContinueButton();

}


function loadCollectionCode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const code =
        params.get(
            "codigo"
        );


    if (!code) {

        window.location.href =
            "../index.html";

        return;

    }


    const collectionCode =
        document.getElementById(
            "collectionCode"
        );


    collectionCode.textContent =
        code;

}


function initializeFileInput() {

    const csvFile =
        document.getElementById(
            "csvFile"
        );

    const uploadArea =
        document.getElementById(
            "uploadArea"
        );

    const btnRemoveFile =
        document.getElementById(
            "btnRemoveFile"
        );


    csvFile.addEventListener(
        "change",
        function () {

            const file =
                csvFile.files[0];


            if (file) {

                processFile(
                    file
                );

            }

        }
    );


    uploadArea.addEventListener(
        "dragover",
        function (
            event
        ) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (
            event
        ) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer
                    .files[0];


            if (!file) {
                return;
            }


            processFile(
                file
            );

        }
    );


    btnRemoveFile.addEventListener(
        "click",
        function () {

            resetImport();

        }
    );

}


async function processFile(
    file
) {

    clearMessage();


    if (
        !isCSVFile(
            file
        )
    ) {

        showMessage(
            "El archivo seleccionado debe ser un CSV.",
            "error"
        );

        return;

    }


    showFileInfo(
        file
    );


    try {

        const result =
            await parseBGGCSV(
                file
            );


        if (
            !result.valid
        ) {

            importedGames = [];


            hidePreview();


            showMessage(
                buildMissingColumnsMessage(
                    result.missingColumns
                ),
                "error"
            );


            return;

        }


        if (
            result.games.length === 0
        ) {

            importedGames = [];


            hidePreview();


            showMessage(
                "El archivo no contiene juegos válidos.",
                "error"
            );


            return;

        }


        importedGames =
            result.games;


        showPreview(
            result.games,
            result.invalidRows,
            result.duplicateRows
        );


        showMessage(
            `CSV leído correctamente. Se encontraron ${result.games.length} juegos.`,
            "success"
        );


        console.log(
            "Juegos preparados:",
            importedGames
        );

    }
    catch (
        error
    ) {

        console.error(
            "Error leyendo CSV:",
            error
        );


        importedGames = [];


        hidePreview();


        showMessage(
            "No fue posible leer el archivo CSV.",
            "error"
        );

    }

}


function showPreview(
    games,
    invalidRows,
    duplicateRows = 0
) {

    const previewSection =
        document.getElementById(
            "previewSection"
        );

    const totalGames =
        document.getElementById(
            "totalGames"
        );

    const invalidGames =
        document.getElementById(
            "invalidGames"
        );

    const previewSummary =
        document.getElementById(
            "previewSummary"
        );

    const tableBody =
        document.getElementById(
            "previewTableBody"
        );


    totalGames.textContent =
        games.length;


    invalidGames.textContent =
        invalidRows;


    let resumen =
        `${games.length} juegos únicos listos para importar.`;


    if (
        duplicateRows > 0
    ) {

        resumen +=
            ` Se encontraron ${duplicateRows} registros duplicados en el CSV.`;

    }


    previewSummary.textContent =
        resumen;


    tableBody.innerHTML =
        "";


    const previewGames =
        games.slice(
            0,
            15
        );


    for (
        const game of previewGames
    ) {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `
            <td>
                ${escapeHTML(game.objectid)}
            </td>

            <td>
                ${escapeHTML(game.objectname)}
            </td>

            <td>
                ${formatValue(game.my_rating)}
            </td>

            <td>
                ${formatValue(game.avgweight)}
            </td>

            <td>
                ${formatPlayers(game)}
            </td>

            <td>
                ${escapeHTML(game.itemtype ?? "-")}
            </td>
        `;


        tableBody.appendChild(
            row
        );

    }


    previewSection.hidden =
        false;

}


function hidePreview() {

    document.getElementById(
        "previewSection"
    ).hidden = true;

}


function showFileInfo(
    file
) {

    const fileInfo =
        document.getElementById(
            "fileInfo"
        );

    const fileName =
        document.getElementById(
            "fileName"
        );

    const fileSize =
        document.getElementById(
            "fileSize"
        );


    fileName.textContent =
        file.name;


    fileSize.textContent =
        formatFileSize(
            file.size
        );


    fileInfo.hidden =
        false;

}


function resetImport() {

    const csvFile =
        document.getElementById(
            "csvFile"
        );


    csvFile.value =
        "";


    importedGames =
        [];


    document.getElementById(
        "fileInfo"
    ).hidden = true;


    hidePreview();

    clearMessage();

}


function initializeContinueButton() {

    const button =
        document.getElementById(
            "btnContinueImport"
        );


    button.addEventListener(
        "click",
        async function () {

            if (
                importedGames.length === 0
            ) {

                showMessage(
                    "Primero selecciona un CSV válido.",
                    "error"
                );

                return;

            }


            await importarColeccion(
                button
            );

        }
    );

}


async function importarColeccion(
    button
) {

    const codigo =
        obtenerCodigoActual();


    if (!codigo) {

        showMessage(
            "No se encontró el código de colección.",
            "error"
        );

        return;

    }


    const textoOriginal =
        button.textContent;


    try {

        button.disabled =
            true;


        button.textContent =
            "Importando colección...";


        showMessage(
            "Procesando colección...",
            "success"
        );


        /*
         * 1.
         * Crear o recuperar
         * el código de colección.
         */

        const {
            collection,
            created
        } =
            await obtenerOCrearColeccion(
                codigo
            );


        console.log(
            created
                ? "Colección creada:"
                : "Colección existente:",
            collection
        );


        /*
         * 2.
         * Insertar juegos globales
         * que todavía no existan.
         */

        await guardarJuegosNuevos(
            importedGames
        );


        /*
         * 3.
         * Recuperar los ID internos
         * de Supabase.
         */

        const objectIds =
            importedGames.map(
                game =>
                    game.objectid
            );


        const juegosRegistrados =
            await obtenerJuegosPorObjectIds(
                objectIds
            );


        if (
            juegosRegistrados.length !==
            importedGames.length
        ) {

            console.warn(
                "Cantidad CSV:",
                importedGames.length
            );

            console.warn(
                "Cantidad encontrada en BD:",
                juegosRegistrados.length
            );

        }


        /*
         * 4.
         * Sincronizar colección.
         */

        const total =
            await sincronizarJuegosColeccion(
                collection.id,
                importedGames,
                juegosRegistrados
            );

        /*
        * 4.1.
        * Crear NO_JUGADO para las
        * combinaciones usuario/juego
        * que todavía no existan.
        */

        await crearReaccionesFaltantesColeccion(
            collection.id
        );


        /*
         * 5.
         * Resultado.
         */

        showMessage(
            created
                ? `Colección creada correctamente con ${total} juegos.`
                : `Colección actualizada correctamente con ${total} juegos.`,
            "success"
        );


        button.textContent =
            "Colección importada ✓";


        console.log(
            "Importación terminada correctamente."
        );


        console.log(
            "Código:",
            collection.codigo
        );


        console.log(
            "ID colección:",
            collection.id
        );


        console.log(
            "Juegos:",
            total
        );

    }
    catch (
        error
    ) {

        console.error(
            "Error importando colección:",
            error
        );


        showMessage(
            error.message ||
            "Ocurrió un error al importar la colección.",
            "error"
        );


        button.textContent =
            textoOriginal;

    }
    finally {

        button.disabled =
            false;

    }

}



function obtenerCodigoActual() {

    const element =
        document.getElementById(
            "collectionCode"
        );


    return element
        ?.textContent
        ?.trim()
        ?.toUpperCase()
        || null;

}


function isCSVFile(
    file
) {

    const name =
        file.name
            .toLowerCase();


    return name.endsWith(
        ".csv"
    );

}


function buildMissingColumnsMessage(
    columns
) {

    return (
        "El CSV no contiene las columnas necesarias: " +
        columns.join(", ")
    );

}


function showMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            "importMessage"
        );


    container.className =
        `import-message ${type}`;


    container.textContent =
        message;


    container.hidden =
        false;

}


function clearMessage() {

    const container =
        document.getElementById(
            "importMessage"
        );


    container.hidden =
        true;


    container.textContent =
        "";


    container.className =
        "import-message";

}


function formatPlayers(
    game
) {

    const min =
        game.minplayers;


    const max =
        game.maxplayers;


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


    return `${min ?? "?"} - ${max ?? "?"}`;

}


function formatValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    return escapeHTML(
        value
    );

}


function formatFileSize(
    bytes
) {

    if (
        bytes < 1024
    ) {

        return `${bytes} B`;

    }


    if (
        bytes < 1024 * 1024
    ) {

        return (
            `${(
                bytes / 1024
            ).toFixed(1)} KB`
        );

    }


    return (
        `${(
            bytes /
            (
                1024 *
                1024
            )
        ).toFixed(1)} MB`
    );

}


function escapeHTML(
    value
) {

    return String(
        value
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