/**
 * Pokémon Companion
 * API Service
 *
 * Single frontend gateway for backend communication.
 *
 * Responsibilities:
 * - Send HTTP requests.
 * - Attach authentication.
 * - Parse backend responses.
 * - Handle API errors.
 *
 * Does NOT:
 * - Store application state.
 * - Contain business logic.
 * - Manage Pokémon state.
 * - Manage battle state.
 * - Manipulate the DOM.
 */

"use strict";


import { getToken } from "../utils/storage.js";


//================================
// Configuration
//================================

const API_BASE_URL =
    "http://localhost:8000/api";


//================================
// API Request
//================================

export async function apiRequest(
    endpoint,
    options = {}
)
{

    const token =
        getToken();


    const headers =
    {

        "Content-Type":
            "application/json",

        ...(token
            ?
            {
                Authorization:
                    `Bearer ${token}`
            }
            :
            {}),

        ...(options.headers || {})

    };


    const config =
    {

        ...options,

        headers

    };


    let response;


    try
    {

        response =
            await fetch(

                `${API_BASE_URL}${endpoint}`,

                config

            );

    }
    catch(error)
    {

        throw new Error(
            "Unable to connect to the server."
        );

    }


    let data =
        null;


    const contentType =
        response.headers.get(
            "content-type"
        );


    if(
        contentType &&
        contentType.includes(
            "application/json"
        )
    )
    {

        data =
            await response.json();

    }
    else
    {

        data =
            await response.text();

    }


    if(
        !response.ok
    )
    {

        const message =

            typeof data === "object"

            &&

            data !== null

            &&

            data.message

                ?

                data.message

                :

                `API request failed (${response.status})`;


        throw new Error(
            message
        );

    }


    return data;

}