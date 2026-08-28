const express =
    require("express");


const cors =
    require("cors");


const dotenv =
    require("dotenv");


const connectDB =
    require("./config/db");


const authRoutes =
    require("./routes/authRoutes");


const battleRoutes =
    require("./routes/battleRoutes");


const pokemonRoutes =
    require("./routes/pokemonRoutes");


// Load environment variables
dotenv.config(
    {
        path:
            "./backend/.env"
    }
);


connectDB();


const app =
    express();


// ===============================
// Middleware
// ===============================

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded(
        {
            extended:
                true
        }
    )
);


// ===============================
// Routes
// ===============================

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/battles",
    battleRoutes
);


app.use(
    "/api/pokemon",
    pokemonRoutes
);


// ===============================
// Health Check
// ===============================

app.get(
    "/",
    (req, res) =>
    {

        res.status(200).json(
            {

                success:
                    true,

                message:
                    "Pokémon Companion API is running 🚀"

            }
        );

    }
);


// ===============================
// 404 Handler
// ===============================

app.use(
    (req, res) =>
    {

        res.status(404).json(
            {

                success:
                    false,

                message:
                    "Route not found"

            }
        );

    }
);


// ===============================
// Server
// ===============================

const PORT =
    process.env.PORT ||
    5000;


app.listen(
    PORT,
    () =>
    {

        console.log(
            `🚀 Server running on http://localhost:${PORT}`
        );

    }
);