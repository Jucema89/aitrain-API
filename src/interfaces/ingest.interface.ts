import { QdrantDB } from "./qdrant.interface"

export interface IngestFile {
    file: Express.Multer.File
    ext: string
    database: QdrantDB
}