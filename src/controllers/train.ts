import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { TrainingPrisma } from '../services/train-prisma.service'
import { Document } from "@langchain/core/documents";
import { Prisma } from '@prisma/client'
import { Ingest } from '../services/ingest.service'
import { TrainingIA } from '../services/langchain.service';
import { OpenAIService } from '../services/openai/openai.service';
import { TrainingOpenAI } from '../interfaces/training.interface';
import { removeLocalFile } from '../helpers/files.handler';

const serviceTraining = new TrainingPrisma()
const serviceOpenAi = new OpenAIService()

async function createTraining(req: Request, res: Response) {
    try {
        const { files } = req
        const payload = req.body as TrainingOpenAI

        const filesArray = files as Express.Multer.File[]

        const saveTraining = await serviceTraining.createOneTrain( payload )

       for( let file of filesArray){
            await serviceTraining.addFileToTrain(
                saveTraining.id,
                'base',
                file
            )
       }

        serviceOpenAi.startCreateTrainingDocs(
            filesArray, payload, saveTraining.id 
        )

        res.status(200).json({
            success: true,
            data: [],
            message: `Entrenamiento creado correctamente con Id: ${saveTraining.id}.`
        })

        } catch (error) {
        handleHttp(res, 'Error in createTraining', error)
    }
}


async function getAllTraining(req: Request, res: Response){
    try {
        const getTrainings = await serviceTraining.getAllTrainingData()

        if(getTrainings){
            res.status(200).json({
                success: true,
                data: getTrainings
            })
        } else {
            res.status(200).json({
                success: false,
                data: getTrainings
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in getAllTraining', error)
    }
}

async function getOneTraining(req: Request, res: Response){
    try {
        const { id } = req.params
        const getTrain = await serviceTraining.getOneTraining(id)

        if(getTrain){
            res.status(200).json({
                success: true,
                data: getTrain
            })
        } else {
            res.status(200).json({
                success: false,
                data: getTrain
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in getOneTraining', error)
    }
}

async function updateTraining(req: Request, res: Response) {
    try {
        const { id, name, role_system } = req.body

        const actualData = await serviceTraining.getOneTraining( id )

        if(actualData){
            const payload: Prisma.TrainDocsUncheckedCreateWithoutFilesInput = {
                ...actualData,
                name,
                role_system
            }
    
            const updateTrain = await serviceTraining.update( id, payload )
            if(updateTrain){
                res.status(200).json({
                    success: true,
                    data: updateTrain
                })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'No pudimos Actualizar el Entenamiento.'
                })
            }
        } else {
            res.status(200).json({
                success: false,
                message: 'No pudimos Encontrar  el Entenamiento a Actualizar.'
            })
        }

    } catch (error) {
        handleHttp(res, 'Error in updateTraining', error)
    }
}


async function deleteTraining(req: Request, res: Response) {
    try {
        const { id } = req.params

        const existTrain = await serviceTraining.getOneTraining( id )
        const filesRemoved: string[] = []

        if(existTrain){
            for(let file of existTrain.files ){
                await removeLocalFile( file.link )
                filesRemoved.push(file.name)
            }

            const removeTrain = await serviceTraining.deleteById( id )

            if(removeTrain.success){
                res.status(200).json({
                    success: true,
                    data: {
                        files_removed: filesRemoved
                    },
                    message: removeTrain.message
                })
            } else {
                res.status(200).json({
                    success: false,
                    data: {
                        files_removed: filesRemoved
                    },
                    message: removeTrain.message
                })
            }

        } else {
            ///error not exist train
            res.status(200).json({
                success: false,
                data: {
                    files_removed: []
                },
                message: 'No existe un train con este ID'
            })
        }

    } catch (error) {
        handleHttp(res, 'Error in deleteTraining', error)
    }
}


export { createTraining, getAllTraining, getOneTraining, updateTraining, deleteTraining }

