import { QdrantClient } from '@qdrant/js-client-rest';
import { Document } from "@langchain/core/documents";
import { QdrantDB } from '../interfaces/qdrant.interface';

export class TrainingIA {

    async generateQuestions(openAIKey: string, database: QdrantDB ){
       
        const qdrant = new QdrantClient({
        url: database.database_url
       });

        const data = await qdrant.api('collections').getCollection({ collection_name: database.database_collection })

        

    //    const collection = await qdrant. (database.database_collection)

    }


    createJsFile(chunksBase: Document<Record<string, any>>[], nameToFile: string): Promise<{
        success: boolean, message: string
    }>{
        const fs = require('fs')

        return new Promise((result, reject) => {
            try {
                const filePath = `${process.cwd()}/chunks/${nameToFile}`;
                const stream = fs.createWriteStream(filePath, { flags: 'a' });
        
                chunksBase.forEach((chunck) => {
                    stream.write(JSON.stringify(chunck) + '\n');
                });
        
                stream.end(() => {
                    console.log(`${nameToFile} Creado exitosamente`)
                    result({ success: true, message: `${nameToFile} Creado Correctamente!`})
                })

            } catch (error) {

                reject(error)
            }
           
        })
        
    }
}