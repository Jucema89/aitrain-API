import prisma from '../database/prisma';
import { Prisma, TypeFile } from '@prisma/client';
import { TrainingData } from '../interfaces/training.interface';

export class Training {

    getAllTrainingData(filters?: any) {
        return prisma.trainRegister.findMany({})
    }

    getOneTraining(id: string){
        return prisma.trainRegister.findUnique({
            where: { id: id}
        })
    }

    createOneTrain(payload: Prisma.TrainRegisterUncheckedCreateInput){
        return prisma.trainRegister.create({ data: payload })
    }

    async update( id: string, payload: Prisma.TrainRegisterUncheckedCreateInput ): Promise<Prisma.Prisma__TrainRegisterClient<TrainingData>> {
        return prisma.trainRegister.update({
            where: { id: id},
            data: payload,
            include: { files: true }
        })
    }

    deleteById(id: string): Promise<{ success: boolean, message: string }> {
        return new Promise(async(result, reject) => {
          const deletedFile = await prisma.trainRegister.delete({
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