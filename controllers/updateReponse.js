import { config } from "../config/config.js";
import mysql from "mysql2";
import * as api from "../api/index.js"

export const updateResponseHuman = async (humanText, phoneNumber) => {
  const pool = mysql.createConnection(config);
  const connection = pool.promise();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM chats WHERE caller = ?",
      [phoneNumber]
    );

    rows[0].chat =
      rows[0].chat.slice(0, -1) +
      `{"role": "Caller", "content": "${humanText}"},` +
      "]";

    const query = "UPDATE chats SET chat = ? WHERE caller = ?";
    await connection.query(query, [rows[0].chat, phoneNumber]);

    const ai = await connection.query(`SELECT * FROM chats WHERE caller = ?`, [
      phoneNumber,
    ]);

    const dataAI = { previous: ai[0][0].chat };
    const aiResponse = await api.aiTalk(dataAI);

    return aiResponse;

  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    connection.end();
  }
};

export const updateResponseAi = async (AiText, phoneNumber) => {
  const pool = mysql.createConnection(config);
  const connection = pool.promise();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM chats WHERE caller = ?",
      [phoneNumber]
    );

    rows[0].chat =
      rows[0].chat.slice(0, -1) +
      `{"role": "Ai", "content": "${AiText}"},` +
      "]";
    rows[0].ai = AiText;

    const query = "UPDATE chats SET chat = ? WHERE caller = ?";
    await connection.query(query, [rows[0].chat, phoneNumber]);

    const query2 = "UPDATE chats SET ai = ? WHERE caller = ?";
    await connection.query(query2, [rows[0].ai, phoneNumber]);

    const query3 = "UPDATE chats SET status = ? WHERE caller = ?";
    await connection.query(query3, [true, phoneNumber]);
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    connection.end();
  }
};
