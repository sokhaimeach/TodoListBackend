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

function getStartOfWeek(date) {
    const d = date ? new Date(date) : new Date();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getEndOfWeek(date) {
    const d = date ? new Date(date) : new Date();
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + 6);
    d.setHours(23, 59, 59, 999);
    return d;
}

function toLocalDateStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    formatDateHour,
    getStartOfWeek,
    getEndOfWeek,
    toLocalDateStr
};