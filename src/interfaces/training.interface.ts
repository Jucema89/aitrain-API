import { File } from "./aws.interface"

export interface Training {
    id: string       
    files: FileTraining[]
    tokens_usage: number
    name :string
    status: StatusFileTrain
    role_system :string           
    modelGeneratorData :string
    openAiKey: string
    type_answer: TypeAnswer
    observations: string
    questions: TrainQuestions[]
    createdAt : Date             
    updatedAt : Date  
}

export type TrainingCreate = Omit<Training, 'id'  | 'createdAt' | 'updatedAt'>;
export type TrainingOpenAI = Omit<Training, 'id'  | 'files' |'questions' | 'createdAt' | 'updatedAt'>;
export type TypeAnswer = 'alls' | 'short' | 'long_explained'

export type StatusFileTrain = 'start' | 'running' | 'finish' | 'cancel' | 'cancel_with_error'
export interface FileTraining {
    id :string                
    fieldName :string
    extension: string
    typeFileInTrain: 'base' | 'final'
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


export interface CreatorQuestion {
    questions: { pregunta: string, respuesta: string }[]
    role_system: string
    tokens_usage: number
}

export interface TrainQuestions {
    id: string
    trainId: string
    questionsAndAnswer: QuestionAnswer[]
}
  
export interface QuestionAnswer {
    id: string
    trainQuestionId: string
    question: string
    answer : string
}
