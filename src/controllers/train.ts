import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { Training } from '../services/train.service'
import { Prisma } from '@prisma/client'

const service = new Training()

async function createTraining(req: Request, res: Response) {
    try {
        const { name, description, modelGeneratorData } = req.body

        const payload: Prisma.TrainRegisterUncheckedCreateInput = {
            name: name, 
            description: description,
            modelGeneratorData: modelGeneratorData
        }

        const createTrain = await service.createOneTrain( payload )
        if(createTrain){
            res.status(200).json({
                success: true,
                data: createTrain
            })
        } else {
            res.status(200).json({
                success: false,
                message: 'No pudimos crear el Entenamiento.'
            })
        }

    } catch (error) {
        handleHttp(res, 'Error in createTraining', error)
    }
}


async function getAllTraining(req: Request, res: Response){
    try {
        const getTrainings = await service.getAllTrainingData()

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
        const getTrain = await service.getOneTraining(id)

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

        const payload: Prisma.TrainRegisterUncheckedCreateInput = {
            name: name, 
            description: description,
            modelGeneratorData: modelGeneratorData
        }

        const updateTrain = await service.update( id, payload )
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



    } catch (error) {
        handleHttp(res, 'Error in updateTraining', error)
    }
}


async function deleteTraining(req: Request, res: Response) {
    try {
        const { id } = req.params
        const removeTrain = await service.deleteById( id )

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

