import * as api from "../api/index.js";
import pkg from "twilio";
import { config } from "../config/config.js";
import mysql from "mysql2";

const { twiml } = pkg;
const VoiceResponse = twiml.VoiceResponse;

export const firstVoice = async (req, res) => {
  const pool = mysql.createConnection(config);
  const connection = pool.promise();

  const twiml = new VoiceResponse();
  const phoneNumber = req.query.From.slice(1);

  try {
    twiml.say(
      "Hye there, i am personal assistant of mr. Deepak. Can you please tell me who you are, and why you want to talk to mr. Deepak. Please start talking after beep sound, and press any key when you will complete talking."
    );
    twiml.record({
      action: "/caller/recording-complete",
      method: "POST",
      maxLength: 60,
      timeout: 5,
      playBeep: true,
    });

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM chats WHERE caller = ?",
        [phoneNumber]
      );

      if (rows.length > 0) {
        await connection.execute("DELETE FROM chats WHERE caller = ?", [
          phoneNumber,
        ]);
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }

    await connection.query(
      `INSERT INTO chats (caller, chat, ai, status) VALUES (?, ?, ?, ?)`,
      [phoneNumber, "[]", "", false]
    );

    res.type("text/xml");
    res.status(200).send(twiml.toString());
  } catch (error) {
    res.status(400).json(error);
  } finally {
    connection.end();
  }
};

export const recordingComplete = async (req, res) => {
  const recordingSid = req.body.RecordingSid;

  const phoneNumber = req.body.From.slice(1);

  const twiml = new VoiceResponse();

  const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILO_SID}/Recordings/${recordingSid}.mp3`;

  const data = {
    audio_url: recordingUrl,
  };
  try {
    api.transcribe(data, phoneNumber);

    twiml.say("We are processing your voice. Please wait for few seconds.");
    twiml.play(
      "https://www.chosic.com/wp-content/uploads/2020/06/Bauchamp_-_1000_bip_bip.mp3"
    );
    twiml.redirect(
      {
        method: "POST",
      },
      "/caller/gather-handler"
    );

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    res.status(400).json(error);
  }
};

export const gatherHandle = async (req, res) => {
  const twiml = new VoiceResponse();
  const phoneNumber = req.body.From.slice(1);

  const pool = mysql.createConnection(config);
  const connection = pool.promise();

  try {
    const ai = await connection.query(`SELECT * FROM chats WHERE caller = ?`, [
      +,
    ]);

    if (ai[0][0].status) {
      const query = "UPDATE chats SET status = ? WHERE caller = ?";
      await connection.query(query, [false, phoneNumber]);

      twiml.say(ai[0][0].ai);
      if (
        ai[0][0].ai.includes("Goodbye") ||
        ai[0][0].ai.includes("Exit") ||
        ai[0][0].ai.includes("Please wait for the admin to contact you") ||
        ai[0][0].ai.includes("contact you shortly")
      ) {
        twiml.hangup();
      } else {
        twiml.record({
          action: "/caller/recording-complete",
          method: "POST",
          maxLength: 60,
          timeout: 5,
          playBeep: true,
        });
      }
    } else {
      twiml.say("We are processing your voice. Please wait for few seconds.");
      twiml.play(
        "https://www.chosic.com/wp-content/uploads/2020/06/Bauchamp_-_1000_bip_bip.mp3"
      );
      twiml.redirect(
        {
          method: "POST",
        },
        "/caller/gather-handler"
      );
    }

    res.type("text/xml");
    res.status(200).send(twiml.toString());
  } catch (error) {
    res.status(400).json(error);
  } finally {
    connection.end();
  }
};
