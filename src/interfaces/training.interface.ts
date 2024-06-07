import { File } from "./aws.interface"

export interface Training {
    id: string       
    files: FileTraining[]
    name :string
    description :string           
    modelGeneratorData :string
    type_answer: TypeAnswer
    createdAt : Date             
    updatedAt : Date  
}

export type TrainingCreate = Omit<Training, 'id'  | 'createdAt' | 'updatedAt'>;
export type TypeAnswer = 'alls' | 'short' | 'long_explained'
export interface FileTraining {
    id :string                
    fieldName :string
    type: 'excel' | 'application' | 'pdf' | 'word' | 'image' | 'video' | 'audio' | 'presentation' | 'other'
    name :string
    link :string
    createdAt :Date             
    updatedAt :Date   
}

export interface ConfigurationEnv {
    id: string
    openAiKey: string
    postgresUrl: string
}

