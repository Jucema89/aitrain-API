import JSZip from 'jszip'
import fs from 'fs'

export interface ZIP_PATHS {
    path: string
    type: 'pdf' | 'image'
    name: string
}
//doc: https://javascript.plainenglish.io/how-to-create-zip-files-with-node-js-505e720ceee1
export class CompresorService {

    createOneFileZIP(filePath: ZIP_PATHS){
       try {
        
       } catch (error) {
        
       }
    }

    createManyFilesZIP(filesPaths: ZIP_PATHS[], nameToZip: string){ 
        try {
            const zip = new JSZip()

            filesPaths.forEach((file) => {
                zip.file(file.path)
            })

            return zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(nameToZip))

        } catch (error) {
         
        }
    }

    createDownloadJSONL(idTrain: string, jsons: string[]): Promise<string> {
        return new Promise(async (result, reject) => {
            try {
                const zip = new JSZip()
                const files = zip.folder("trainers")

                if(files){
                    jsons.forEach((path) => {
                        const jsonData = fs.readFileSync(path);
                        const arraString = path.split('/')
                        const pathName: string = arraString.pop() as string
                        files.file(pathName, jsonData);
                    })
                }
    
                const pathCreateZip = `${process.cwd()}/trainers/files_training_${idTrain}.zip`
    
                zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(pathCreateZip))
                .on('finish', function () {
                    result(`files_training_${idTrain}.zip`)
                })

            } catch (error) {
                console.log('error createDownloadJSONL = ', error)
                reject(error)
            }
        })
    }
    
    
}