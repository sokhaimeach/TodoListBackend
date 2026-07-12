const app = require('./src/app');
const { sequelize } = require('./src/models');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await sequelize.close();
            console.log("Database connection closed.");
        } catch (err) {
            console.error("Error closing database:", err.message);
        }
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
