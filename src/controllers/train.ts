import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { TrainingPrisma } from '../services/train-prisma.service'
import { Document } from "@langchain/core/documents";
import { Prisma } from '@prisma/client'
import { Ingest } from '../services/ingest.service'
import { TrainingIA } from '../services/train-langchain.service';

const serviceTraining = new TrainingPrisma()
const serviceTrainingIA = new TrainingIA()
const serviceIngest = new Ingest()

async function createTraining(req: Request, res: Response) {
    try {
        const { files } = req
        const { name, description, modelGeneratorData } = req.body

        const filesArray = files as Express.Multer.File[]

        const payload: Prisma.TrainUncheckedCreateInput = {
            name: name, 
            description: description,
            modelGeneratorData: modelGeneratorData,
        }

        //create Train in DB Postgress
        const createTrain = await serviceTraining.createOneTrain( payload )
        //create data in Vector Database
        // const databaseVector: QdrantDB = {
        //     database_url: qdrantUrl,
        //     database_key: qdrantKey,
        //     database_collection: qdrantName
        // }

        const ingestSuccess = []

              for(let file of filesArray){
                const arrString: string[] = file.originalname.split('.')
                const extension = arrString[arrString.length -1]

                const chunks: Document<Record<string, any>>[] = await serviceIngest.ingestSplitter(file.path, extension)

                const respopnseTrain = await serviceTrainingIA.createJsFile(chunks, `${file.originalname}.js`)
                ingestSuccess.push( respopnseTrain ) 
                // const data: IngestFile = {
                //     file: file,
                //     ext: extension,
                //     database: databaseVector
                // }

                // const serviceResponse = await serviceIngest.uploadSingleFileQdrant(
                //     data
                // )

                // ingestSuccess.push( serviceResponse ) 
            }

        if(ingestSuccess && createTrain){
            if(createTrain){
                res.status(200).json({
                    success: true,
                    data: ingestSuccess
                })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'No pudimos crear el Entenamiento.'
                })
            }
        }

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
        const { id, name, description, modelGeneratorData } = req.body

        const actualData = await serviceTraining.getOneTraining( id )

        if(actualData){
            const payload: Prisma.TrainRegisterUncheckedCreateInput = {
                ...actualData,
                name: name, 
                description: description,
                modelGeneratorData: modelGeneratorData
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
        const removeTrain = await serviceTraining.deleteById( id )

        if(removeTrain.success){
            res.status(200).json({
                success: true,
                data: removeTrain
            })
        }else {
            res.status(200).json({
                success: false,
                data: removeTrain
            })
        }

    } catch (error) {
        handleHttp(res, 'Error in deleteTraining', error)
    }
}


export { createTraining, getAllTraining, getOneTraining, updateTraining, deleteTraining }

