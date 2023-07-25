import * as api from "../api/index.js"

export const checkStatus = async (url) => {
  while (true) {
    try {
      const response = await api.textToSpeech(url);
      const data = response.data;

      switch (data.status) {
        case "queued":
        case "processing":
          console.log(
            "AssemblyAI is still transcribing your audio, please try again in a few minutes!"
          );
          await new Promise((resolve) => setTimeout(resolve, 2500));
          break;
        case "completed":
          return data.text;
        default:
          console.log(`Something went wrong :-( : ${data.status}`);
          return; 
      }
    } catch (error) {
      console.error(`Error: ${error}`);
      return; 
    }
  }
};
