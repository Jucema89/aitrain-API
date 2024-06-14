import fs from "fs";
import OpenAI from 'openai'
import { OpenaiFile, OpenAiFinetuned, OpenaiFinetuning, OpenaiFinetuningResponse } from "../../interfaces/openai.interface";
import { FineTuningJob } from "openai/resources/fine-tuning/jobs/jobs";

//doc https://platform.openai.com/docs/api-reference/fine-tuning/create
export class OpenAiFinetuningService {

    async createFinetuningJob(payload: OpenaiFinetuning): Promise<OpenaiFinetuningResponse>{

        const openai = new OpenAI({
            apiKey: payload.apiKey
        })

        const fineTune = await openai.fineTuning.jobs.create({
            training_file: payload.training_file,
            model: payload.model,
            validation_file: payload.validation_file,
            suffix: payload.name
        })

        return fineTune as OpenaiFinetuningResponse
    }

    async fetchAllFineTuningJobs(apiKey: string) {

        const openai = new OpenAI({
            apiKey: apiKey
        })

        const allFineTuningJobs = [];
        for await (const fineTuningJob of openai.fineTuning.jobs.list({ limit: 20 })) {
          allFineTuningJobs.push(fineTuningJob);
        }
        return allFineTuningJobs;
    }

    async fetchOneFineTuningJob(apiKey: string, idJob: string): Promise<FineTuningJob> {
        const openai = new OpenAI({
            apiKey: apiKey
        })

       const ftModel = await  openai.fineTuning.jobs.retrieve(idJob)
       return ftModel
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