import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

export class DatabaseQdrant {

    /**
     * Search similarity string in Database and return of definited numbers of doc inline for this criteria
     * @param search String similarity search
     * @param docsRetrive Number Docs retirve
     * @param collection Name collection for search
     */
    async searchSimilarity(search: string, docsRetrive: number, collection: string) {
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            new OpenAIEmbeddings(),
            {
                url: process.env.QDRANT_URL,
                collectionName: collection,
                apiKey: `${process.env.QDRANT_KEY}`
            }
        )
        
        return await vectorStore.similaritySearch(search, docsRetrive)
    }
}