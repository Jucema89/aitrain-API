import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { OpenAIService } from '../services/openai/openai.service'
import { OpenaiFile, OpenaiFinetuning, OpenAiModelsResponse } from '../interfaces/openai.interface'
import { OpenAiFinetuningService } from '../services/openai/openai-finetuning.service'
import { TrainingPrisma } from '../services/train-prisma.service'

const serviceOpenAI = new OpenAIService()
const serviceFinetunningOpenAI = new OpenAiFinetuningService()
const serviceTrainDocs = new TrainingPrisma()

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

async function getAllFinetunigs(req: Request, res: Response) {
    try {
        const { api_key } = req.params

        const finetunings = await serviceFinetunningOpenAI.fetchAllFineTuningJobs( api_key )

        if(finetunings){
            res.status(200).json({
                success: true,
                data: finetunings
            })
        } else {
            res.status(200).json({
                success: false,
                data: [],
                message: 'No Existen Modelos Finetuning con la api_key proporcionada'
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in getAllFinetunnigs', error)
    }
}

async function getOneFinetunig(req: Request, res: Response) {
    try {
        const { api_key, id } = req.params

        const ftModel = await serviceFinetunningOpenAI.fetchOneFineTuningJob( api_key, id )

        if(ftModel){
            res.status(200).json({
                success: true,
                data: ftModel
            })
        } else {
            res.status(200).json({
                success: false,
                data: [],
                message: 'No Existe Modelo Finetuning con el ID proporcionado'
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in getOneFinetunigs', error)
    }
}

async function createFinetunigs(req: Request, res: Response) {
    try {
        const { apiKey, idDoc, model, name } = req.body

        //get trainDocs base for fuinetunning
        const docTrain = await serviceTrainDocs.getOneTraining( idDoc )
        
        if(docTrain){
            const filesUploadedInOpenai:{ type: string, file: OpenaiFile }[] = []
            const filesJsonl = docTrain.files.filter((file) => file.typeFileInTrain === 'final')
            
            for(let file of filesJsonl){
                //upload docs for trainig into OpenAI
                const updateFile = await serviceFinetunningOpenAI.uploadFile(apiKey, file.link)
                filesUploadedInOpenai.push({
                    type: file.fieldName,
                    file: updateFile
                })
            }

            const trainFile: OpenaiFile = filesUploadedInOpenai.find((file) => file.type === 'train')?.file as OpenaiFile

            const validateFile: OpenaiFile = filesUploadedInOpenai.find((file) => file.type === 'validate')?.file as OpenaiFile
    
            const payload: OpenaiFinetuning = {
                apiKey: apiKey,
                training_file: trainFile.id,
                validation_file: validateFile.id,
                model,
                name
            }

            console.log('payload to openAI = ', payload)

            const createJob = await serviceFinetunningOpenAI.createFinetuningJob( payload )
            if(createJob){
                res.status(200).json({
                    success: true,
                    data: createJob
                })
            } else {
                res.status(200).json({
                    success: false,
                    data: createJob,
                    message: 'Error creando Job de Finetuninig in OpenAI'
                })
            }

        } else {
            res.status(200).json({
                success: false,
                message: 'No existe un Documento de entrenamiento con ese Id'
            })
        }
    } catch (error) {
        //handleHttp(res, 'Error in createFinetunigs', error)
        res.status(200).json({
            success: false,
            message: error
        })
    }
}


export {
    getModelsAvailable,
    getAllFinetunigs,
    getOneFinetunig,
    createFinetunigs
}