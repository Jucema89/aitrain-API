import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { OpenAIService } from '../services/openai.service'

const serviceOpenAI = new OpenAIService()

async function getModelsAvailable(req: Request, res: Response) {
    try {
        const { apiKey } = req.body

        const models = await serviceOpenAI.getListModelsAvailables( apiKey )
        if(models){
            res.status(200).json({
                success: true,
                data: models,
            })
        } else {
            res.status(200).json({
                success: false,
                data: []
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in get models OpenAi Availables', error)
    }
}


export {
    getModelsAvailable
}