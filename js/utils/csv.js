const REQUIRED_COLUMNS = [
    "objectid",
    "objectname",
    "originalname",
    "rating",
    "avgweight",
    "itemtype",
    "minplayers",
    "maxplayers"
];


export function parseBGGCSV(file) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            if (!window.Papa) {

                reject(
                    new Error(
                        "No se pudo cargar el lector de CSV."
                    )
                );

                return;

            }


            window.Papa.parse(
                file,
                {

                    header: true,

                    skipEmptyLines: true,

                    transformHeader:
                        normalizeHeader,

                    complete:
                        function (
                            results
                        ) {

                            resolve(
                                processCSVResults(
                                    results
                                )
                            );

                        },

                    error:
                        function (
                            error
                        ) {

                            reject(
                                error
                            );

                        }

                }
            );

        }
    );

}


function processCSVResults(
    results
) {

    const headers =
        results.meta.fields || [];


    const missingColumns =
        REQUIRED_COLUMNS.filter(
            column =>
                !headers.includes(
                    column
                )
        );


    if (
        missingColumns.length > 0
    ) {

        return {

            valid: false,

            missingColumns,

            games: [],

            invalidRows:
                results.data.length,

            parserErrors:
                results.errors

        };

    }


    const gamesMap =
    new Map();

    let invalidRows = 0;

    let duplicateRows = 0;


    for (
        const row of results.data
    ) {

        const game =
            normalizeGame(
                row
            );


        if (!game) {

            invalidRows++;

            continue;

        }


        if (
            gamesMap.has(
                game.objectid
            )
        ) {

            duplicateRows++;

        }


        /*
        * Si el mismo ObjectID aparece
        * más de una vez en el CSV,
        * conservamos la última aparición.
        */
        gamesMap.set(
            game.objectid,
            game
        );

    }


    const games =
        Array.from(
            gamesMap.values()
        );


    return {

        valid: true,

        missingColumns: [],

        games,

        invalidRows,

        duplicateRows,

        parserErrors:
            results.errors

    };

}


function normalizeHeader(
    header
) {

    return String(
        header ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /^\uFEFF/,
            ""
        );

}


function normalizeGame(
    row
) {

    const objectid =
        parseInteger(
            row.objectid
        );


    const objectname =
        normalizeText(
            row.objectname
        );


    if (
        !objectid ||
        !objectname
    ) {

        return null;

    }


    return {

        objectid,

        objectname,

        originalname:
            normalizeNullableText(
                row.originalname
            ),

        my_rating:
            parseDecimal(
                row.rating
            ),

        avgweight:
            parseDecimal(
                row.avgweight
            ),

        itemtype:
            normalizeNullableText(
                row.itemtype
            ),

        minplayers:
            parseInteger(
                row.minplayers
            ),

        maxplayers:
            parseInteger(
                row.maxplayers
            )

    };

}


function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim();

}


function normalizeNullableText(
    value
) {

    const normalized =
        normalizeText(
            value
        );


    return normalized || null;

}


function parseInteger(
    value
) {

    const normalized =
        normalizeText(
            value
        );


    if (!normalized) {

        return null;

    }


    const number =
        Number.parseInt(
            normalized,
            10
        );


    return Number.isFinite(
        number
    )
        ? number
        : null;

}


function parseDecimal(
    value
) {

    const normalized =
        normalizeText(
            value
        )
            .replace(
                ",",
                "."
            );


    if (!normalized) {

        return null;

    }


    const number =
        Number.parseFloat(
            normalized
        );


    return Number.isFinite(
        number
    )
        ? number
        : null;

}