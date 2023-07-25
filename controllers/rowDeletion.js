import { config } from "../config/config.js";
import mysql from "mysql2";

const pool = mysql.createConnection(config);
const connection = pool.promise();

const waitTimeInMilliseconds = 10 * 60 * 1000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const deleteRowAfterDelay = async (rowId) => {
  try {
    await delay(waitTimeInMilliseconds);

    const deleteQuery = `DELETE FROM chats WHERE id = ?`;
    const [result] = await connection.execute(deleteQuery, [rowId]);

    console.log("Row deleted successfully:", result.affectedRows);
  } catch (error) {
    console.error("Error deleting row:", error);
  } finally {
    connection.end();
  }
};
