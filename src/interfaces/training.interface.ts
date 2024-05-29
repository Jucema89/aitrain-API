import { File } from "./aws.interface"

export interface TrainingData {
    id: string
    files: File[]
    name: string
    description: string
    modelGeneratorData: string
    DB_VectorName: string
}