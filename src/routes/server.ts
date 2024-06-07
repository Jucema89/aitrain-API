// /server/validate/
import { Router } from "express";
import { Request, Response } from 'express'
import { check } from "express-validator";
import { validateFields } from "../middleware/validate-fields";

const router = Router()

router.get('/validate',
    ((req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            data: {
                message: 'Server backend Aitrain ready'
            }
        })
    })
)


export { router }
