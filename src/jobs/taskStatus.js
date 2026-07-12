const cron = require("node-cron");
const { Op } = require("sequelize");
const { Task } = require("../models");

// run every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
    try {
        const today = new Date();

        // mark overdue TODO and IN_PROGRESS tasks as MISSED
        const [updatedCount] = await Task.update(
            { status: "MISSED" },
            {
                where: {
                    dueDate: {
                        [Op.lt]: today,
                    },
                    status: {
                        [Op.in]: ["TODO", "IN_PROGRESS"]
                    },
                },
            }
        );

        if (updatedCount > 0) {
            console.log(`Cron: ${updatedCount} overdue tasks marked as MISSED`);
        }
    } catch (error) {
        console.error("Cron error:", error);
    }
}, {
    timezone: 'Asia/Phnom_Penh'
});
