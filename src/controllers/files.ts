import { Request, Response } from 'express'
import { handleHttp } from '../helpers/error.handler'
import { FileService } from '../services/files.service'
import { TrainingPrisma } from '../services/train-prisma.service'
import { removeLocalFile } from '../helpers/files.handler'

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

            const filesJson = train.files.filter((file) => file.typeFileInTrain === 'final')
            const filesUrls = filesJson.map((file) => file.link)

            const fileDownload = await serviceFile.downloadTrainersJSONLs(res, train.id, filesUrls)

            if(fileDownload){
                res.setHeader('Content-Disposition', `attachment; filename="files_training_${train.id}.zip"`);
                fileDownload.pipe( res )

                res.on('finish', () => {
                    removeLocalFile(
                        `${process.cwd()}/trainers/files_training_${train.id}.zip`
                    )
                });

            } else {
                res.status(200).json({
                    success: false,
                    message: 'No encontramos los archivos .jsonl asociados a este proyecto'
                })
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