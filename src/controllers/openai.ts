import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { OpenAIService } from '../services/openai/openai.service'
import { OpenAiModelsResponse } from '../interfaces/openai.interface'

const serviceOpenAI = new OpenAIService()

async function getModelsAvailable(req: Request, res: Response) {
    try {
        const { apiKey } = req.body

        const models: OpenAiModelsResponse = await serviceOpenAI.getListModelsAvailables( apiKey )

        console.log('Models in controller = ', models)
        if(models.success){
            res.status(200).json({
                success: true,
                data: models.data,
            })
        } else {
            res.status(200).json({
                success: false,
                data: [],
                message: models.error.message
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in get models OpenAi Availables', error)
    }
}


export {
    getModelsAvailable,
}