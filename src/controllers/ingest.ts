// import { Request, Response } from 'express'
// import { Ingest } from '../services/ingest.service'
// import { handleHttp } from '../helpers/error.handler'
// import { CollectionDB } from '../interfaces/qdrant.interface'
// import { TypeDocIngest } from '../interfaces/ingest.interface'

// const ingest = new Ingest()

// async function ingestFile(req: Request, res: Response) {
//     try {
//         const { file } = req
//         const { typedoc } = req.params
//         const { awsKeyId, awsAccessKey, awsBucket, awsRegion, openAiKey, openAiModel, qdrantName, qdrantKey, qdrantUrl,  } = req.body
//         const docType: TypeDocIngest = typedoc as TypeDocIngest

//         const fileToSave = file as Express.Multer.File
//         const arrString: string[] = fileToSave.originalname.split('.')
//         const extension = arrString[arrString.length -1]
//         const serviceResponse = await ingest.uploadSingleFileQdrant(fileToSave, extension, docType)

//         if(serviceResponse){
//             res.status(200).json({
//                 success: true,
//                 message: 'Archivo guardado Correctamente'
//             })
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: 'No pudimos guardar el archivo'
//             })
//         }
        
//     } catch (error) {
//         handleHttp(res, 'Error in controller Ingest', error)
//     }
// }

// async function ingestMultipleFiles(req: Request, res: Response) {
//     try {
//         const { files } = req
//         const { typedoc } = req.params
//         const docType: TypeDocIngest = typedoc as TypeDocIngest

//         const filesArray = files as Express.Multer.File[]

//         const filesResponse = []
//         for(let fileToSave of filesArray){
//             const arrString: string[] = fileToSave.originalname.split('.')
//             const extension = arrString[arrString.length -1]
//             const serviceResponse = await ingest.uploadSingleFileQdrant(fileToSave, extension, docType)

//             filesResponse.push( serviceResponse )
//         }
        
//         if(filesResponse.length){
//             res.status(200).json({
//                 success: true,
//                 message: 'Archivos guardados Correctamente'
//             })
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: 'No pudimos guardar los archivos'
//             })
//         }
        
//     } catch (error) {
//         handleHttp(res, 'Error in controller Ingest Multiple Files', error)
//     }
// }

// async function ingestSitemap(req: Request, res: Response){
//     try {
//         const url  = req.body.url

//         const ingestSitemap = await ingest.uploadFromSitemap( url )
//         console.log('ingestFinish = ', ingestSitemap)
//         if(ingestSitemap){
//             res.status(200).json({
//                 success: true,
//                 message: 'Ingesta desde SiteMap Lista'
//             })
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: 'No pudimos ingestar desde el siteMap'
//             })
//         }


//     } catch (error) {
//         handleHttp(res, 'Error in controller ingest Sitemap', error)
//     }
// }

// async function ingestURL(req: Request, res: Response) {

//     try {
//         console.log('req.body ', req.body)
//         const url  = req.body.url
//         const ingestURL = await ingest.uploadFromWeb( url )
//         console.log('ingestFinish = ', ingestURL)

//         if(ingestURL){
//             res.status(200).json({
//                 success: true,
//                 message: 'Ingesta desde Web guardado Correctamente'
//             })
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: 'No pudimos ingestar desde la web'
//             })
//         }


//     } catch (error) {
//         handleHttp(res, 'Error in controller Ingest Url', error)
//     }
// }

// export {
//     ingestFile,
//     ingestMultipleFiles,
//     ingestURL,
//     ingestSitemap
// }