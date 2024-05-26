import { NextFunction, Request, Response } from "express";

export function increaseTimeout(req: Request, res: Response, next: NextFunction) {
    // Establecer el tiempo de espera en 10 minutos (600000 milisegundos)
    req.setTimeout(600000);
    next();
}; 