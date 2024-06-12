import prisma from '../database/prisma';
import { Prisma, TypeFileTrain } from '@prisma/client';
import { Training } from '../interfaces/training.interface';
import { AWSService } from './aws.service';

export class TrainingPrisma {

    private awsService = new AWSService()

    getAllTrainingData(filters?: any) {
        return prisma.trainDocs.findMany({ include: { files: true }})
    }

    getOneTraining(id: string) {
        return prisma.trainDocs.findUnique({
            where: { id: id },
            include: { files: true }
        })
    }

    createOneTrain(payload: Prisma.TrainDocsUncheckedCreateInput){
        return prisma.trainDocs.create({ data: payload })
    }

    async addFileToTrain(
        trainId: string, 
        typeFile: TypeFileTrain,
        fileData: Express.Multer.File) {
        try {
          // exist train?
          const train = await prisma.trainDocs.findUnique({
            where: { id: trainId },
          });
      
          if (!train) {
            throw new Error('Train not found');
          }

          const arrString: string[] = fileData.originalname.split('.')
          const extension = arrString[arrString.length -1]
      
          const file = await prisma.file.create({
            data: {
              trainId: trainId,
              fieldName: fileData.fieldname,
              extension,
              typeFileInTrain: typeFile,
              name: fileData.originalname,
              link: `${process.cwd()}/uploads/${fileData.filename}`,
            },
          })
      
          return file

        } catch (error) {
          throw new Error(`Failed to add file to Train: ${error}`);
        }
      }

    async update( id: string, payload: Prisma.TrainDocsUncheckedCreateWithoutFilesInput ): Promise<Prisma.Prisma__TrainDocsClient<Training>> {
        return prisma.trainDocs.update({
            where: { id: id},
            data: payload,
            include: { files: true }
        })
    }

    deleteById(id: string): Promise<{ success: boolean, message: string }> {
        return new Promise(async(result, reject) => {
          const deletedFile = await prisma.trainDocs.delete({
            where: { id: id }
          })
          
          if(!deletedFile){
            throw new Error('not remeove Training using this id')
          } else {
            result({
                success: true,
                message: 'Se Elimino File en Base de datos y en AWS'
            })
          }
        })
    }

} 