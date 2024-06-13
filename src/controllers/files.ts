import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { FileService } from '../services/files.service'
import { TrainingPrisma } from '../services/train-prisma.service'

const serviceFile = new FileService()
const serviceTrain = new TrainingPrisma()

async function downloadFile(req: Request, res: Response) {
    try {
        const { folder, namefile } = req.params

        const filePath = `${process.cwd()}/${folder}/${namefile}`

        serviceFile.downloadFile(res, filePath, namefile)

        
    } catch (error) {
        handleHttp(res, 'Error in downloadFileTrain', error)
    }
}

async function downloadJsonL(req: Request, res: Response) {
    try {
        const { id } = req.params
        const train = await serviceTrain.getOneTraining(id)

        if(train){

            console.log('trains in trainer = ', train.files)

            for(let file of train.files){

                if(file.typeFileInTrain === 'final'){
                    await serviceFile.downloadFile(res, file.link, file.name)
                }
            }
        } else {
            res.status(200).json({
                success: false,
                data: [],
                message: 'No existen documentos de entrenamiento bajo ese Id'
            })
        }
        
    } catch (error) {
        handleHttp(res, 'Error in downloadFileTrain', error)
    }
}


export {
    downloadFile,
    downloadJsonL
}