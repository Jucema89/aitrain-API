import fs from 'fs';
import { Response } from 'express'
import { Readable } from 'node:stream';
import * as fsPromises from "node:fs/promises";
import { AWSService } from './aws.service';
import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';
import { FileTraining } from '../interfaces/training.interface';
import { CompresorService } from './compresor.service';

export class FileService {

  private serviceAWS = new AWSService()
  private serviceCompresor = new CompresorService()

  getAll(filters: any) {
    return prisma.file.findMany({})
  }

  async create(payload: Prisma.FileUncheckedCreateInput): Promise<Prisma.Prisma__FileClient<FileTraining>> {
      const file = await prisma.file.create({ data: payload });
      return file
  }

  async update( id: string, payload: Prisma.FileUncheckedCreateInput ): Promise<Prisma.Prisma__FileClient<FileTraining>> {

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

  async getById (id: string): Promise<Prisma.Prisma__FileClient<FileTraining>> {

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

  async getFile(filePath: string) {
    try {
      await fsPromises.access(filePath, fsPromises.constants.F_OK)
      return filePath;
    } catch (err) {
      throw new Error('File not found');
    }
  }

  async downloadFile(res: Response, filePath: string, filename: string):Promise<boolean> {
    return new Promise((result, reject) => {
      try {
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream')
  
        const fileStream: Readable =  fs.createReadStream(
         filePath
        )
        fileStream.pipe(res)
  
        res.on('finish', () => {
          result(true);
        });
  
      } catch (error) {
        reject(error)
      }
    })
  }

  downloadTrainersJSONLs(res: Response, idTrain: string, filesUrls: string[]): Promise<Readable>{
    return new Promise(async (result, reject) => {
      try {
        const urlZipFile = await this.serviceCompresor.createDownloadJSONL(idTrain, filesUrls)
        const fileStream: Readable =  fs.createReadStream(
          `${process.cwd()}/trainers/${urlZipFile}`
        )

        result(fileStream)
        
      } catch (error) {
        console.log('error downloadTrainersJSONLs = ', error)
        reject(error)
      }
    })

  }

}