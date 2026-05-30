const cron = require("node-cron");
const { Op } = require("sequelize");
const { Task } = require("../models");

// run every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
    try {
        const today = new Date();

        const [updatedCount] = await Task.update(
            { status: "MISSED" },
            {
                where: {
                    dueDate: {
                        [Op.lt]: today,
                    },
                    status: "TODO",
                },
            }
        );

        console.log(`${updatedCount} tasks updated to MISSED`);
    } catch (error) {
        console.error("Cron error:", error);
    }
}, {
    timezone: 'Asia/Phnom_Penh'
});