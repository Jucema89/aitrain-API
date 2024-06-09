import fs from "fs";
import * as fsPromises from "node:fs/promises";
import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenaiFile, OpenaiFinetuning, OpenaiFinetuningResponse, OpenAiModelsResponse } from '../../interfaces/openai.interface';
import { MessageContent } from "openai/resources/beta/threads/messages";
import { Ingest } from "../ingest.service";
import { TrainingOpenAI } from "../../interfaces/training.interface";

export class OpenAIService {

    private serviceIngest = new Ingest();

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


    async transformDocsToText(files: Express.Multer.File[]):Promise<string[]> {
        const chuncksText: string[] = []

        for( let file of files ){

            const arrString: string[] = file.originalname.split('.')
            const extension = arrString[arrString.length -1]

            const filePath = `${process.cwd()}/uploads/${file.filename}`

            const documents = await this.serviceIngest.filesToDocument( filePath, extension )

            documents.forEach((doc) => {
                chuncksText.push( doc.pageContent )
            })
        }

        return chuncksText
    }

    async multimodalQuestion(
        files: Express.Multer.File[], payload: TrainingOpenAI){

        const filesText = await this.transformDocsToText( files )

        const chat = new ChatOpenAI({
            model: "gpt-3.5",
            maxTokens: 1024,
            apiKey: payload.openAiKey
        })

        for(let text of filesText){
            const message = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: "Dame 1 pregunta con su respuesta basada en este documento. Pregunta y respuesta de maximo 200 caracteres",
                },
                {
                    type: "text",
                    text: text
                }
            ],
            })
        
            const res = await chat.invoke([message])
        }
        
    }

}