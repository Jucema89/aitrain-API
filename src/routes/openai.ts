import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middleware/validate-fields";
import { getModelsAvailable } from "../controllers/openai";


const router = Router()
router.post('/get-models',
    check('apiKey', 'el apiKey es requerido').not().isEmpty(),
    check('apiKey', 'El apiKey debe ser un String').isString(),
    validateFields,
    getModelsAvailable
)
// validateKeyOpenAI(apiKey: string):Observable<boolean>{
//     return this.http.post<{success: boolean, is_valid: boolean}>('/openai/validate-key/', { apiKey: apiKey }).pipe(map((res) => res.is_valid))
//   }

export { router }