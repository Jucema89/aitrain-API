import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { SitemapLoader } from "@langchain/community/document_loaders/web/sitemap";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { errorHandlerService } from "../helpers/error.handler";
//EMBEDDINGS FILES
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { createIndex } from "../database/qdrant";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { QdrantDB } from "../interfaces/qdrant.interface";
import { IngestFile } from "../interfaces/ingest.interface";

export class Ingest {

    private VECTOR_STORE = process.env.STORE_MODE ?? ""
    private FROM_PATH = `${process.cwd()}/data`

    private imageExtensionsAvailable = [
        'png', 'jpg', 'jpeg', 'gif'
    ]

    private pdfExtensionsAvailable = [
        'pdf', 'PDF'
    ]

    private excelExtensionsAvaliable = [
        'xls', 'xlsx',
    ]

    private wordExtensionsAvaliable = [
        'txt', 'docx', 'doc', 'rtf'
    ]

    private audioExtensionsAvaliable = [
        'aac', 'mp3', 'oga', 'wav', 'weba'
    ]

    private videoExtensionsAvaliable = [
        'wav', 'webm', 'ogv', 'mp4',
    ]

    private presentationsExtensionsAvaliable = [
        'ppt', 'pptx'
    ]

    private othersExtensionsAvaliable = [
        'xml', 'svg', 'zip'
    ]

    /**
     * Upload to vector database data form website using pupetter
     * @param url Url with data
     * @returns 
     */
    async uploadFromWeb(url: string, database: QdrantDB){
        try {
            const loader = new PuppeteerWebBaseLoader(url)
            const scrapperData = await loader.load()

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1200,
                chunkOverlap: 100,
            })

            const chunks = await textSplitter.splitDocuments(scrapperData);

            if(chunks.length > 500){
                //indexing big docs
                const groupChuncks = this.groupChuncks(chunks, 500)

                console.log('arrayChuncks', groupChuncks)
                console.log('arrayChuncks Lengt', groupChuncks.length)

                //iterate block of 500docs array for indexing
                for(let chunk of groupChuncks){
                    console.log('iterate create index')
                    await createIndex(chunk, database)  
                }

            } else if(chunks.length <= 500){
                //indexing documents smalls
                return createIndex(chunks, database)  
            }
            
        } catch (error) {
            errorHandlerService(error, 'ERROR_INGEST_FROM_WEB', `error when to ingest data form url ${url} using puppetter`)
        }
    }


    async uploadFromSitemap(url: string){
        try {
            const loader = new SitemapLoader(url)
            const docs = await loader.load()
            console.log(docs.length)
            return docs
        } catch (error) {
            return error
        }
    }

    async uploadFolderComplete(database: QdrantDB){
        try {

            const directoryLoader = new DirectoryLoader(this.FROM_PATH, {
                ".ts": (path) => new TextLoader(path),
                ".js": (path) => new TextLoader(path),
                ".txt": (path) => new TextLoader(path),
            });
            
            const rawDocs = await directoryLoader.load();
            const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            });
        
            const docs = await textSplitter.splitDocuments(rawDocs)
            //if (this.VECTOR_STORE === "pinecone") await runPinecone(docs);
            await createIndex(docs, database)

            
        } catch (error) {
            errorHandlerService(error, 'ERROR_INGEST_FROM_FOLDER_COMPLETE', `error when to ingest data form folder`)
        }
    }
   
    // async uploadFolderComplete(database: QdrantDB){
    //     try {

    //         const directoryLoader = new DirectoryLoader(this.FROM_PATH, {
    //             ".ts": (path) => new TextLoader(path),
    //             ".js": (path) => new TextLoader(path),
    //             ".txt": (path) => new TextLoader(path),
    //         });
            
    //         const rawDocs = await directoryLoader.load();
    //         const textSplitter = new RecursiveCharacterTextSplitter({
    //         chunkSize: 1000,
    //         chunkOverlap: 200,
    //         });
        
    //         const docs = await textSplitter.splitDocuments(rawDocs)
    //         //if (this.VECTOR_STORE === "pinecone") await runPinecone(docs);
    //         await createIndex(docs, database)

            
    //     } catch (error) {
    //         errorHandlerService(error, 'ERROR_INGEST_FROM_FOLDER_COMPLETE', `error when to ingest data form folder`)
    //     }
    // }

    /**
     * 
     * @param file 
     * @param ext 
     * @returns 
     * @deprecated
     */
    async uploadSingleFile(file: Express.Multer.File, ext: string, database: QdrantDB){
        try {
            const chunks = await this.ingestSplitter(file.path, ext)
            return createIndex(chunks, database)

        } catch (error) {
            console.log('error uploadSingleFile => ', error)
            return(error)
        }
    }

    async uploadSingleFileQdrant( data: IngestFile ): Promise<QdrantVectorStore | QdrantVectorStore[] | undefined> {
        const responses: QdrantVectorStore[] = []

        try {
            const chunks = await this.ingestSplitter(data.file.path, data.ext)
            
            if(chunks.length > 500){
                //indexing big docs
                const groupChuncks = this.groupChuncks(chunks, 500)

                console.log('arrayChuncks', groupChuncks)
                console.log('arrayChuncks Lengt', groupChuncks.length)

                //iterate block of 500docs array for indexing

                
                for(let chunk of groupChuncks){
                    console.log('iterate create index')
                    let res = await createIndex(chunk, data.database)
                    responses.push( res )
                }

                return responses

            } else if(chunks.length <= 500){
                //indexing documents smalls
                const response = await createIndex(chunks, data.database)
                return response
            }
            
        } catch (error) {
            console.log('error Multiple File Upload => ', error)
            return responses
            //return(error)
        }
    }

    groupChuncks(array: Document[], groupLength: number): Document<Record<string, any>>[][]{
        const groupChunk = [];
        for (let i = 0; i < array.length; i += groupLength) {
            groupChunk.push(array.slice(i, i + groupLength));
        }

        return groupChunk;
    }


    /**
     * Get a file to transform embedding using especific type file and return document ready to upload to vector database
     * @param pathFile route of file to embedding 
     * @param ext extension file
     * @returns 
     */
    async ingestSplitter(
        pathFile: string, 
        ext: string, 
    ):Promise<Document<Record<string, any>>[]> {

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 600,
            chunkOverlap: 60
        })

        let loader
        let rawDocs: Document<Record<string, any>>[]

        if(this.pdfExtensionsAvailable.includes(ext)){
            loader = new PDFLoader(pathFile)
            rawDocs = await loader.load()
            
            const docPDF = await textSplitter.splitDocuments(rawDocs);
            return docPDF
        }

        if(this.excelExtensionsAvaliable.includes(ext)){
            loader = new CSVLoader(pathFile)
            rawDocs = await loader.load()
         
            const docXLS = await textSplitter.splitDocuments(rawDocs);
            return docXLS
        }

        if(this.wordExtensionsAvaliable.includes(ext)){
            loader = new TextLoader(pathFile)
            rawDocs = await loader.load()
          
            const docTXT = await textSplitter.splitDocuments(rawDocs);
            return docTXT
        }

        if(ext === 'json'){
            loader = new JSONLoader(pathFile)
            rawDocs = await loader.load()
            
            const docJson = await textSplitter.splitDocuments(rawDocs);
            return docJson
        }

        throw new Error('Extension File is not extension valid.')
    }


}