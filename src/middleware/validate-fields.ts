 import { Request, Response, NextFunction } from 'express';
 import { validationResult }from 'express-validator';

const validateFields = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult( req );

    if( !errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.mapped()
        });
    }
    
    next();
}

export { validateFields }