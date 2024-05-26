import { Response } from "express";

export const handleHttp = (res: Response, errorMessage: string, error: Error | any) => {
    errorsLogger(error, errorMessage)
    res.status(500).send({
        success: false,
        message: errorMessage,
        error
    })
}

export const errorHandlerService = (error: any, name: string, description: string) => {
    console.error(`${name} : ${description}`)
    console.error(error)
}

export function errorsLogger(error: any, errorMessage: string){
    // TODO: guardado de logs de errores en bases de datos, logs externos u otro lado

    console.error(errorMessage, error)
}