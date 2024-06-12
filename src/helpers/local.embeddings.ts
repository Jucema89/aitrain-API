import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/dist/document";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

const DIR = `${process.cwd()}/store`

const runLocal = async (docs: Document<Record<string, any>>[]) => {
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  }));
  await vectorStore.save(DIR);
};

export { runLocal };

