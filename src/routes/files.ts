import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middleware/validate-fields";
import { downloadFile, downloadJsonL } from "../controllers/files";

const router = Router()

router.get('/download-jsonl/:id',
    downloadJsonL
)

export { router }