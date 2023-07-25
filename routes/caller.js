import express  from "express";

import { firstVoice, recordingComplete, gatherHandle } from "../controllers/caller.js"

const router = express.Router();

router.get('/voice', firstVoice)
router.post('/recording-complete', recordingComplete)
router.post('/gather-handler', gatherHandle)

export default router