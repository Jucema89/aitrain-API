import { Router } from "express";
import { check } from "express-validator";
import { validateFields } from "../middleware/validate-fields";
import { createFinetunigs, getAllFinetunigs, getModelsAvailable, getOneFinetunig } from "../controllers/openai";


const router = Router()
router
.post('/get-models',
    check('apiKey', 'el apiKey es requerido').not().isEmpty(),
    check('apiKey', 'El apiKey debe ser un String').isString(),
    validateFields,
    getModelsAvailable
)
//finetunnig routing
.get('/finetuning/alls/:api_key',
    getAllFinetunigs
)
.get('/finetuning/one/:api_key/:id',
    getOneFinetunig
)
.post('/finetuning/create/',
    check('apiKey', 'el apiKey es requerido').not().isEmpty(),
    check('apiKey', 'El apiKey debe ser un String').isString(),
    check('idDoc', 'el idDoc es requerido').not().isEmpty(),
    check('idDoc', 'El idDoc debe ser un String').isString(),
    check('model', 'el model es requerido').not().isEmpty(),
    check('model', 'El model debe ser un String').isString(),
    check('name', 'el nombre es requerido').not().isEmpty(),
    check('name', 'El nombre debe ser un String').isString(),
    validateFields,
    createFinetunigs
)

export { router }