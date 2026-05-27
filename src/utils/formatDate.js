const formatDateHour = (date, type = "from") => {

    if (!date) return new Date();

    const [year, month, day] = date.split("-");

    const d = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    if (type === "from") {
        d.setHours(0, 0, 0, 0);
    } else {
        d.setHours(23, 59, 59, 999);
    }

    return d;
};

module.exports = formatDateHour;