import { Router } from "express";
import { check } from "express-validator";
import { createTraining, deleteTraining, getAllTraining, getOneTraining, updateTraining } from "../controllers/train";
import { validateFields } from "../middleware/validate-fields";
import { multerMultiple } from "../middleware/file-upload";

const router = Router()

router
.post('/create', 
    // check('name', 'el nombre es requerido').not().isEmpty(),
    // check('name', 'El nombre debe ser un String').isString(),
    // check('description', 'la descripcion es requerida').not().isEmpty(),
    // check('description', 'la descreipcion debe ser String').isString(),
    // validateFields,
    multerMultiple,
    createTraining
)

.get('/alls', getAllTraining )
.get('/one/:id', getOneTraining)
.put('/update', updateTraining) 
.delete('/delete/:id', deleteTraining)

export { router }