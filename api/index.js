import axios from "axios";
import { checkStatus } from "../controllers/statusChecker.js";
import dotenv from "dotenv";
import {updateResponseAi ,updateResponseHuman} from "../controllers/updateReponse.js"

dotenv.config();

const baseUrlTranscript = "https://api.assemblyai.com/v2";
const baseUrlAI = "https://auto-call-ai.onrender.com/api/";

const params = {
  headers: {
    authorization: `${process.env.TRASCRIPTION_KEY}`,
    "content-type": "application/json",
  },
};

const API = axios.create();

API.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...params.headers };
  return config;
});

export const aiTalk = (dataAI) =>
  axios.post(baseUrlAI + "/aiResponse", dataAI);

export const transcribe = (audioData, phoneNumber) =>
  API.post(baseUrlTranscript + "/transcript", audioData)
    .then(async (response) => {
      const idRecording = response.data["id"];
      const humanText = await checkStatus(
        baseUrlTranscript + "/transcript" + "/" + idRecording
      );

      const aiResponse = await updateResponseHuman(humanText, phoneNumber)

      updateResponseAi(aiResponse.data.message, phoneNumber);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

export const textToSpeech = (url) => API.get(url);
