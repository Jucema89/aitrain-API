import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { SitemapLoader } from "langchain/document_loaders/web/sitemap";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { errorHandlerService } from "../helpers/error.handler";
//EMBEDDINGS FILES
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { createIndex } from "../database/qdrant";
import { TypeDocIngest } from "../interfaces/ingest.interface";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";



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
    async uploadFromWeb(url: string){
        try {
            const loader = new PuppeteerWebBaseLoader(url)
            const scrapperData = await loader.load()

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1200,
                chunkOverlap: 100,
                separators: ["Artículo", "ARTICULO", " ", "."],
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
                    await createIndex(chunk)  
                }

            } else if(chunks.length <= 500){
                //indexing documents smalls
                return createIndex(chunks)  
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
    /**
     * Upload alls files in Folder 'data' to Pinecone
     */
    async uploadFolderComplete(){
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
            await createIndex(docs)

            
        } catch (error) {
            errorHandlerService(error, 'ERROR_INGEST_FROM_FOLDER_COMPLETE', `error when to ingest data form folder`)
        }
    }

    /**
     * 
     * @param file 
     * @param ext 
     * @returns 
     * @deprecated
     */
    async uploadSingleFile(file: Express.Multer.File, ext: string, typeDoc: TypeDocIngest){
        try {
            const chunks = await this.ingestSplitter(file.path, ext, typeDoc)
            return createIndex(chunks)

        } catch (error) {
            console.log('error uploadSingleFile => ', error)
            return(error)
        }
    }

    async uploadSingleFileQdrant(file: Express.Multer.File, ext: string, typeDoc: TypeDocIngest): Promise<QdrantVectorStore | QdrantVectorStore[] | undefined> {
        const responses: QdrantVectorStore[] = []

        try {
            const chunks = await this.ingestSplitter(file.path, ext, typeDoc)
            
            if(chunks.length > 500){
                //indexing big docs
                const groupChuncks = this.groupChuncks(chunks, 500)

                console.log('arrayChuncks', groupChuncks)
                console.log('arrayChuncks Lengt', groupChuncks.length)

                //iterate block of 500docs array for indexing

                
                for(let chunk of groupChuncks){
                    console.log('iterate create index')
                    let res = await createIndex(chunk)
                    responses.push( res )
                }

                return responses

            } else if(chunks.length <= 500){
                //indexing documents smalls
                const response = await createIndex(chunks)
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
        typeDoc: TypeDocIngest
    ):Promise<Document<Record<string, any>>[]> {

        let textSplitter: RecursiveCharacterTextSplitter

        if(typeDoc === 'codex' || typeDoc === 'law'){
            textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 600,
                chunkOverlap: 60,
                separators: ["Artículo", "ARTICULO", " ", "."],
            })
        } else {
            textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 600,
                chunkOverlap: 60
            })
        }

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