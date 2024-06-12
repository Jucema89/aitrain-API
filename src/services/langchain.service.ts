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


    createJslFiles(data: CreatorQuestion, idTrain: string, ): Promise<{
        success: boolean, trainJsonUrl: string, validateJsonUrl: string
    }>{
        const fs = require('fs')

        return new Promise((result, reject) => {
            try {

                let response = {
                    success: false, 
                    trainJsonUrl: '', 
                    validateJsonUrl: ''
                }

                const arrayTrain = data.questions
                const arrayValidate = arrayTrain.splice(0, 20)

                const filePathTraining = `${process.cwd()}/trainers/training-${idTrain}.jsonl`;
                const streamTraining = fs.createWriteStream(filePathTraining, { flags: 'a' })

                arrayTrain.forEach((QandR) => {
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

                      streamTraining.write(JSON.stringify(newJson) + '\n');
                })
        
                streamTraining.end(() => {
                    console.log(`${filePathTraining} Creado exitosamente`)
                })

                const filePathValidate = `${process.cwd()}/trainers/validate-${idTrain}.jsonl`;
                const streamValidate = fs.createWriteStream(filePathValidate, { flags: 'a' })

                arrayValidate.forEach((QandR) => {
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

                      streamValidate.write(JSON.stringify(newJson) + '\n');
                })

                streamValidate.end(() => {
                    console.log(`${filePathValidate} Creado exitosamente`)
                })

                response.success = true
                response.validateJsonUrl = filePathValidate
                response.trainJsonUrl = filePathTraining
                
                result( response )

            } catch (error) {
                console.log('Error created JsonlFiles')
                reject(error)
            }
           
        })
        
    }
}