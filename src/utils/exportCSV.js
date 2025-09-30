const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

function exportToCSV(data) {
  const filePath = path.join(__dirname, "records.csv");

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "userId", title: "USER" },
      { id: "date", title: "DATE" },
      { id: "checkin", title: "CHECKIN" },
      { id: "checkout", title: "CHECKOUT" },
      { id: "workedHours", title: "HOURS" }
    ]
  });

  csvWriter.writeRecords(data);
  return filePath;
}

module.exports = { exportToCSV };
