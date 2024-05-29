import { File } from '../interfaces/aws.interface'

import { DataCreateFile, FileDataSave } from '../interfaces/aws.interface';
import { AWSService } from './aws.service';
import prisma from '../database/prisma';
import { Prisma, TypeFile } from '@prisma/client';

export class FileService extends AWSService {

  private serviceAWS = new AWSService();

  getAll(filters: any) {
    return prisma.file.findMany({})
  }

  async create(payload: Prisma.FileUncheckedCreateInput): Promise<Prisma.Prisma__FileClient<File>> {
      const file = await prisma.file.create({ data: payload });
      return file
  }

  createMany( files: Express.Multer.File[], idRegister:string )
  :Promise<Prisma.FileUncheckedCreateInput[]> {
    return new Promise(async (result, reject) => {
      try { 

        //archivos subiendo a AWS
        const filesUpload: FileDataSave[] = await this.multiFilesUpload(files)

        const filesSuccess: Prisma.FileUncheckedCreateInput[] = [];

        if(filesUpload.length){

          for(let i: number = 0; i < filesUpload.length; i++){

            let payload: Prisma.FileUncheckedCreateInput;

            payload = { 
              ...filesUpload[i],
              registerId: idRegister
            }

            //archivos registrados en DB
            const fileSave = await prisma.file.create({ data: payload });

            filesSuccess.push( fileSave )
          }

          result(filesSuccess)

        } else {
          reject('Error: Files array is Empty')
        }

      } catch (error) {
        console.log('error Upload array Files ', error);
        reject(error)
      }
    })
  }

  async update( id: string, payload: Prisma.FileUncheckedCreateInput ): Promise<Prisma.Prisma__FileClient<File>> {

    const fileUpdate = await prisma.file.update({
      where: {
				id: id,
			},
			data: payload,
    })

    if (!fileUpdate) {
        throw new Error('not found')
    }

    return fileUpdate
  }

  async getById (id: string): Promise<Prisma.Prisma__FileClient<File>> {

    const fileGet = await prisma.file.findUnique({
      where: {
        id: id,
      },
    })

    if (!fileGet) {
        throw new Error('not found')
    }
    return fileGet
  }

  deleteById(id: string): Promise<{ success: boolean, message: string }> {
    return new Promise(async(result, reject) => {
      const deletedFile = await prisma.file.delete({
        where: { id: id }
      })
      
      if(!deletedFile){
        throw new Error('not remeove File usin this id')
      }

      const removeAWS = await this.serviceAWS.removeFile( deletedFile.link );

      if(removeAWS){
        result({
          success: true,
          message: 'Se Elimino File en Base de datos y en AWS'
        })
      } else {
        reject({
          success: false,
          message: removeAWS
        })
      }
    })
  }


  /**
 *
 * @param files Arreglo de Archivos a los que se validan extensiones
 * @param extensions Array con extensiones validas para el; grupo de archivos
 * @returns Un string con un mensaje de exito o un mensaje con el listado de errores encontrados
 */
  validateFiles(files: Express.Multer.File[], extensions: string[]): Promise<string> {
    return new Promise((result, reject) => {
        try {

            const extensionsFiles: { fieldname: string, type: string}[] = [];
            const messageError: string[] = [];

            files.forEach(( file: Express.Multer.File ) => {

                let ext: string[] | string = file.originalname.split('.')
                ext = ext.pop() || '';

                extensionsFiles.push({
                    fieldname: file.fieldname,
                    type: ext
                })
            })

            extensionsFiles.forEach((extension) => {
                if(!extensions.includes(extension.type)){
                    messageError.push(
                        `El campo ${extension.fieldname} tiene una extension ${extension.type} que no es valida para el tipo de Archivo`
                    )
                }
            })

            if(messageError.length){
                result(messageError.toString())
            } else {
                result('Extension Files Correct')
            }

        } catch (error) {
            reject(error)
        }
    })
  }

}