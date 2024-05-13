const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const globalErrorHandler = require("./controller/errorController");

const userRouter = require("./routes/userRoutes");
const staffRouter = require("./routes/staffRoutes");

dotenv.config({ path: "./.env" });

const app = express();

// List of allowed origins
const allowedOrigins = [
    'https://micro-finance-portal.netlify.app',
    'https://shimmering-begonia-efc2fa.netlify.app/',
    "http://localhost:5173",
    "http://localhost:3000"
];

// CORS options delegate
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

// Apply CORS dynamically based on the origin of the request
app.use(cors(corsOptionsDelegate));

// app.use(cors());
app.use(express.json({ limit: "10kb" }));

// routes
app.use("/api/v1/loan", userRouter);
app.use("/api/v1/staff", staffRouter);

app.all("/", (req, res, next) => {
    res.send("hello, this is Micro Finance!!")
});

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("DB connection success"));

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server running to port ${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

