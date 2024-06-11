import { QdrantClient } from '@qdrant/js-client-rest';
import { Document } from "@langchain/core/documents";
import { QdrantDB } from '../interfaces/qdrant.interface';

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CreatorQuestion } from '../interfaces/training.interface';


export class TrainingIA {

    async generateQuestions(openAIKey: string, database: QdrantDB ){
       
        const qdrant = new QdrantClient({
        url: database.database_url
       });

        const data = await qdrant.api('collections').getCollection({ collection_name: database.database_collection }) 

    }


    async loadVectorStoreMemory(openAIKey: string, docs: Document<Record<string, any>>[]){
        const vectorStore = await MemoryVectorStore.fromDocuments(
            docs,
            new OpenAIEmbeddings({
                apiKey: openAIKey,
                modelName: "text-embedding-3-small"
            })
        )

        return vectorStore.memoryVectors
    }


    createJslFile(data: CreatorQuestion, nameToFile: string): Promise<{
        success: boolean, message: string
    }>{
        const fs = require('fs')

        return new Promise((result, reject) => {
            try {
                const filePath = `${process.cwd()}/trainers/${nameToFile}.jsonl`;
                const stream = fs.createWriteStream(filePath, { flags: 'a' });

                data.questions.forEach((QandR) => {
                    let newJson = {
                        "messages":[
                              {
                                "role":"system",
                                "content":`${data.role_system}`
                              },
                              {
                                "role":"user",
                                "content":`${QandR.pregunta}`
                              },
                              {
                                "role":"assistant",
                                "content":`${QandR.respuesta}`
                              }
                          ]
                      }

                    stream.write(JSON.stringify(newJson) + '\n');
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