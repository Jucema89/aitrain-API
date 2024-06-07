import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';
import { Training } from '../interfaces/training.interface';

export class TrainingPrisma {

    getAllTrainingData(filters?: any) {
        return prisma.train.findMany({})
    }

    getOneTraining(id: string){
        return prisma.train.findUnique({
            where: { id: id}
        })
    }

    createOneTrain(payload: Prisma.TrainUncheckedCreateInput){
        return prisma.train.create({ data: payload })
    }

    async update( id: string, payload: Prisma.TrainUncheckedCreateInput ): Promise<Prisma.Prisma__TrainClient<Training>> {
        return prisma.train.update({
            where: { id: id},
            data: payload,
            include: { files: true }
        })
    }

    deleteById(id: string): Promise<{ success: boolean, message: string }> {
        return new Promise(async(result, reject) => {
          const deletedFile = await prisma.train.delete({
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