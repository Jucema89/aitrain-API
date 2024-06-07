import OpenAI from 'openai';
import fs from "fs";
import { OpenaiFile, OpenaiFinetuning, OpenaiFinetuningResponse, OpenAiModelsResponse } from '../interfaces/openai.interface';

export class OpenAIService {

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

}