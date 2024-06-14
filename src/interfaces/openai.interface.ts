import OpenAI from "openai"

export interface OpenaiFinetuning {
    apiKey: string
    name: string
    training_file: string
    validation_file: string
    model: string
}

export interface OpenaiFinetuningResponse {
    object: string
    id: string
    model: string
    created_at: number
    fine_tuned_model: string | null
    organization_id: string
    result_files: any[]
    status: string
    validation_file: string
    training_file: string
}

export interface OpenaiFile {
    id: string
    object: string
    bytes: number
    created_at: number
    filename: string
    purpose: string
}

export interface OpenAiModelsResponse { 
    success: boolean,
    data: OpenAI.Model[],
    error: {
        status: number,
        message: string
    }
}

export interface OpenAiFinetuned {
    object: string
    id: string
    model: string //model origin 
    created_at: number
    finished_at: number
    fine_tuned_model: string //name model
    organization_id: string
    result_files: string[],
    status: string
    validation_file: null,
    training_file: string,
    hyperparameters: {
        n_epochs: number
        batch_size: number
        learning_rate_multiplier: number
    },
    trained_tokens: number
    integrations: any[],
    seed: number
    estimated_finish: number
  }
  

