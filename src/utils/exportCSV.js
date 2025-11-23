import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportToCSV = async (data) => {
  const filePath = path.join(__dirname, "../public/exports/records.csv");

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "username", title: "USUARIO" },
      { id: "fecha", title: "FECHA" },
      { id: "entrada", title: "ENTRADA" },
      { id: "salida", title: "SALIDA" },
      { id: "horasTrabajadas", title: "HORAS_TRABAJADAS" },
      { id: "tardanza", title: "TARDANZA" },
    ],
  });

  await csvWriter.writeRecords(data);
  return filePath;
};
