import "dotenv/config"
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantDB } from "../interfaces/qdrant.interface";

async function createIndex(docs: Document<Record<string, any>>[], database: QdrantDB){

    const vectorStore = await QdrantVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        }),
        {
            url: database.database_url,
            collectionName: database.database_collection,
            apiKey: database.database_key
        }
    )

    return vectorStore
}

async function queryDocs(db: string, query: string) {
 
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        }),
        {
            url: process.env.QDRANT_URL,
            collectionName: db,
            apiKey: `${process.env.QDRANT_KEY}`
        }
        );
        
    return await vectorStore.similaritySearch(query, 2);
}

export {
    createIndex,
    queryDocs
}


