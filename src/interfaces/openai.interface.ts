export interface OpenaiFinetuning {
    apiKey: string
    training_file: string
    model: string
    validation_file: string
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
