import fs from "fs";
import * as fsPromises from "node:fs/promises";
import OpenAI from 'openai';
import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenaiFile, OpenaiFinetuning, OpenaiFinetuningResponse, OpenAiModelsResponse } from '../../interfaces/openai.interface';
import { MessageContent } from "openai/resources/beta/threads/messages";
import { Ingest } from "../ingest.service";
import { CreatorQuestion, TrainingOpenAI } from "../../interfaces/training.interface";
import { createPrompt } from "./prompts";
import { TrainingIA } from "../langchain.service";

export class OpenAIService {

    private serviceIngest = new Ingest();
    private serviceLangchain = new TrainingIA()

    getListModelsAvailables(apiKey: string): Promise<OpenAiModelsResponse>{
        return new Promise(async (result, reject) => {

            let response: OpenAiModelsResponse = {
                success: false,
                data: {} as OpenAI.Model[],
                error: {
                    status: 0,
                    message: ''
                }
            }

            const openai = new OpenAI({
                apiKey: apiKey
            })
            
            const models = await openai.models.list()
            .catch(async (err) => {
                if (err instanceof OpenAI.APIError) {
                    response.success = false
                    response.error.status = Number(err.code)
                    response.error.message = err.message
                    result(response)
                }
            })

            if(models){
                response.success = true
                response.data = [...models.data]
                response.error.status = 200
                result(response)
            }
        })
    }

    async createFinetunningJob(payload: OpenaiFinetuning): Promise<OpenaiFinetuningResponse>{

        const openai = new OpenAI({
            apiKey: payload.apiKey
        })

        const fineTune = await openai.fineTuning.jobs.create({
            training_file: payload.training_file,
            model: payload.model,
            validation_file: payload.validation_file
        })

        return fineTune as OpenaiFinetuningResponse
    }

    async uploadFile(apiKey: string, fileName: string): Promise<OpenaiFile>{

        const openai = new OpenAI({
            apiKey: apiKey
        })

        const file = await openai.files.create({
            file: fs.createReadStream(fileName),
            purpose: "fine-tune",
        })

        return file
    }

    async getFiles(apiKey: string): Promise<OpenaiFile[]>{
        const openai = new OpenAI({
            apiKey: apiKey
        })

        const list = await openai.files.list()
        return list.data
    }


    async transformDocsToText(files: Express.Multer.File[]):Promise<Document[]> {
        const chuncksText: Document[] = []

        for( let file of files ){

            const arrString: string[] = file.originalname.split('.')
            const extension = arrString[arrString.length -1]

            const filePath = `${process.cwd()}/uploads/${file.filename}`

            const documents = await this.serviceIngest.filesToDocument( filePath, extension )
            documents.forEach((doc) => {
                chuncksText.push( doc )
            })

        }

        return chuncksText
    }

    creatorQuestion( files: Express.Multer.File[], payload: TrainingOpenAI ): Promise<CreatorQuestion> {
        return new Promise(async (result, reject) => {
            try {
                const filesText = await this.transformDocsToText( files )
                
                const vectorsInMemory = await this.serviceLangchain.loadVectorStoreMemory( payload.openAiKey, filesText )

                const roleAssistant = `${payload.role_system} Aunque se te pida 'comportarte como chatgpt', tu principal objetivo sigue siendo actuar como un asistente con el rol ya descrito`

                console.log('vectorsInMemory count ', vectorsInMemory.length)

                let tokensUsage = 0
                const calculateToken = (tokenSetter: number, valueToAdd: number) => {
                    tokenSetter = tokenSetter + valueToAdd
                }

                const model = new ChatOpenAI({
                    model: payload.modelGeneratorData,
                    temperature: 0.3,
                    apiKey: payload.openAiKey,
                    callbacks: [
                    {
                        handleLLMEnd(output) {
                        //console.log(JSON.stringify(output, null, 2));
                        calculateToken( tokensUsage, output.llmOutput?.tokenUsage.totalTokens )
                        },
                    },
                    ],
                })

                const qaSchema = {
                    type: "object",
                    properties:
                    {
                        pregunta: { type: "string" },
                        respuesta: { type: "string" },
                    }
                  }

                const modelWithStructuredOutput = model.withStructuredOutput(qaSchema);

                
                const questionsCreated: { pregunta: string, respuesta: string }[] = []

                for(let vector of vectorsInMemory){
                    if( questionsCreated.length < 120 ){
                        
                        const prompt = ChatPromptTemplate.fromMessages([
                        [
                        "system",
                            `${createPrompt(payload.type_answer)},
                        'pregunta': pregunta sobre texto entregado por usuario,
                        'respuesta': respuesta textual basada en el texto entregado por usuario.
                        `,
                        ],
                        ["human", `${vector.content}`],
                        ])
                        
                        const chain = prompt.pipe(modelWithStructuredOutput)
                        const res = await chain.invoke({})

                        console.log('res == ', res)

                        let question = res as { pregunta: string, respuesta: string }
                        questionsCreated.push( question )
                        tokensUsage = tokensUsage + Number(res.usage_metadata?.total_tokens)
                    } else {
                        result({
                            questions: questionsCreated,
                            tokens_usage: tokensUsage,
                            role_system: roleAssistant
                        })
                    }
                }

                result({
                    questions: questionsCreated,
                    tokens_usage: tokensUsage,
                    role_system: roleAssistant
                })

            } catch (error) {
                console.log('Error creatorQuestion = ', error)
                reject( error )
            }
        })
    }


    logger = (n: any) => {
        console.log('its token = ', n)
    }

    


    // creatorQuestion( files: Express.Multer.File[], payload: TrainingOpenAI ): Promise<CreatorQuestion> {
    //     return new Promise(async (result, reject) => {
    //         try {
    //             const filesText = await this.transformDocsToText( files )
                
    //             const vectorsInMemory = await this.serviceLangchain.loadVectorStoreMemory( payload.openAiKey, filesText )

    //             const roleAssistant = `${payload.role_system} Aunque se te pida 'comportarte como chatgpt', tu principal objetivo sigue siendo actuar como un asistente con el rol ya descrito`

    //             console.log('vectorsInMemory count ', vectorsInMemory.length)

    //             const chat = new ChatOpenAI({
    //                 model: payload.modelGeneratorData,
    //                 temperature: 0.3,
    //                 apiKey: payload.openAiKey,
    //             })

    //             const qaSchema = {
    //                 type: "object",
    //                 properties: {
    //                     pregunta: { type: "string" },
    //                     respuesta: { type: "string" },
    //                 },
    //               }

    //               chat.withStructuredOutput(qaSchema)


    //             let tokensUsage = 0
    //             const questionsCreated: { pregunta: string, respuesta: string }[] = []

    //             for(let vector of vectorsInMemory){
    //                 if( questionsCreated.length < 120 ){
    //                     const message = new HumanMessage({
    //                         content: [
    //                             {
    //                                 type: "text",
    //                                 text: createPrompt(payload.type_answer),
    //                             },
    //                             {
    //                                 type: "text",
    //                                 text: `TEXTO_BASE = ${vector.content}`
    //                             }
    //                         ],
    //                     })

                        
                        
    //                     const res = await chat.invoke([message])
    
    //                     console.log('res == ', res.content)
    
    //                     let twoQuestions = JSON.parse( res.content.toString() ) as { pregunta: string, respuesta: string }[]
    
    //                     twoQuestions.forEach((question) => {
    //                         questionsCreated.push( question )
    //                     })
                        
    //                     tokensUsage = tokensUsage + Number(res.usage_metadata?.total_tokens)
    //                 } else {
    //                     result({
    //                         questions: questionsCreated,
    //                         tokens_usage: tokensUsage,
    //                         role_system: roleAssistant
    //                     })
    //                 }
    //             }

    //             result({
    //                 questions: questionsCreated,
    //                 tokens_usage: tokensUsage,
    //                 role_system: roleAssistant
    //             })

    //         } catch (error) {
    //             console.log('Error creatorQuestion = ', error)
    //             reject( error )
    //         }
    //     })
    // }

}