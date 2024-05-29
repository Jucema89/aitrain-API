import OpenAI from 'openai';
import fs from "fs";
import { OpenaiFile, OpenaiFinetuning, OpenaiFinetuningResponse } from '../interfaces/openai.interface';

export class OpenAIService {

    async getListModelsAvailables(apiKey: string){
        const openai = new OpenAI({
            apiKey: apiKey
        })

        const list = await openai.models.list()
        return list
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