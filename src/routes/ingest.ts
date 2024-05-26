import { Router } from "express";
import { check } from "express-validator";
import { multerSingle, multerMultiple } from "../middleware/file-upload";
import { ingestFile, ingestMultipleFiles, ingestSitemap, ingestURL } from "../controllers/ingest";
import { increaseTimeout } from "../middleware/requets-options";

const router = Router()

router
    .post('/single/:typedoc', multerSingle, increaseTimeout, ingestFile)
    .post('/multiple', multerMultiple, ingestMultipleFiles)
    .post('/url', increaseTimeout, ingestURL)
    .post('/sitemap', increaseTimeout, ingestSitemap)

  
export { router }
