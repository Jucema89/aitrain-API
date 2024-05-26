import "dotenv/config"
import * as fs from 'node:fs'

import { 
    S3Client, 
    GetObjectCommand, 
    PutObjectCommand, 
    DeleteObjectCommand,
    GetObjectCommandOutput,
    PutObjectCommandOutput,
    DeleteObjectCommandOutput
} from "@aws-sdk/client-s3";
import { removeLocalFile } from "../helpers/files.handler";
import { FileDataSave, TypeFile, AwsResponse, DataForFile } from "../interfaces/aws.interface";

//==Folders en S3==
//pdf
//images
//excel
//word
//other
//audio
//video

export class AWSService {

    client = new S3Client({ 
        region: process.env.AWS_BUCKET_REGION 
    });

    //extensions FIles Availables: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

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
        'docx', 'doc',
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

    private selectFolder = {
        excel: 'excel',
        application: 'pdf',
        word: 'word',
        image: 'images',
        video: 'video',
        audio: 'audio',
        presentation: 'ppt',
        other: 'other'
    }

    async getFile ( folder: string, fileKey: string ) {
        const image = {
            Bucket: process.env.AWS_BUCKET, 
            Key: `${folder}/${fileKey}`,
        }

        const command = new GetObjectCommand(image);
        return await this.client.send(command);
    }

    /**
     * 
     * @param file Archivo a subir
     * @param folder Carpeta del S3 en AWS en la que se guardara el archivo
     * @returns {AwsResponse} respuesta con resultado y link de acceso al archivo
     */
    uploadFile(file: Express.Multer.File, type: TypeFile): Promise<AwsResponse>{

        return new Promise(async (result, reject) => {
            try {
                
                const dataFile: DataForFile = await this.extensionValidator(type, file.filename);

                if(dataFile.success){

                    const fileStream = fs.createReadStream(`${process.cwd()}/uploads/${file.filename}`);

                    //se coloca en lowercase la extension
                    let arrayString: string[] = file.filename.split('.');
                    const fileName = `${arrayString[0]}.${arrayString[1].toLowerCase()}`;

                    const params = {
                        Body: fileStream, 
                        Bucket: process.env.AWS_BUCKET, 
                        Key: `${dataFile.folder}/${fileName}`,
                        ContentType: `${dataFile.contentType}`,
                    };
                    
                    const command = new PutObjectCommand(params);
                    const responseAws: PutObjectCommandOutput = await this.client.send(command);
                
                    if(responseAws.$metadata.httpStatusCode = 200){
                    
                        const resDelete = await removeLocalFile(`${process.cwd()}/uploads/${file.filename}`);
                
                        if(resDelete){
                            result({
                                success: true,
                                status: 200,
                                message: 'File Save Successfully',
                                link: `${dataFile.folder}/${file.filename}`
                            })
                        }
    
                    } else {
                        result({
                            success: false,
                            status: 403,
                            link: '',
                            message: 'Cloud Error, We cant save this',
                        })
                    }

                } else {
                    result({
                        success: false,
                        status: 404,
                        message: dataFile.message,
                        link: ''
                    });
                }
            } catch (error) {
                console.log('error aws imagen = ', error);
                reject({
                    ok: false,
                    status: 500,
                    msg: 'Error de servidor subiendo Imagen',
                })
            }
        })
    }

     /**
     * Toma un archivo desde el folder de Uploads y lo sube a AWS
     * @param nameFile Nombre del Archivo a subir
     * @returns {AwsResponse} respuesta con resultado y link de acceso al archivo
     */
     uploadFromFolder(nameFile: string, type: TypeFile): Promise<AwsResponse>{

        return new Promise(async (result, reject) => {
            try {
                
                const dataFile: DataForFile = await this.extensionValidator(type, nameFile);

                if(dataFile.success){

                    const fileStream = fs.createReadStream(`${process.cwd()}/uploads/${nameFile}`);

                    //se coloca en lowercase la extension
                    let arrayString: string[] = nameFile.split('.');
                    const fileName = `${arrayString[0]}.${arrayString[1].toLowerCase()}`;

                    const params = {
                        Body: fileStream, 
                        Bucket: process.env.AWS_BUCKET, 
                        Key: `${dataFile.folder}/${fileName}`,
                        ContentType: `${dataFile.contentType}`,
                    };
                    
                    const command = new PutObjectCommand(params);
                    const responseAws: PutObjectCommandOutput = await this.client.send(command);
                
                    if(responseAws.$metadata.httpStatusCode = 200){
                    
                        const resDelete = await removeLocalFile(`${process.cwd()}/uploads/${nameFile}`);
                
                        if(resDelete){
                            result({
                                success: true,
                                status: 200,
                                message: 'File Save Successfully',
                                link: `${dataFile.folder}/${nameFile}`
                            })
                        }
    
                    } else {
                        result({
                            success: false,
                            status: 403,
                            link: '',
                            message: 'Cloud Error, We cant save this',
                        })
                    }

                } else {
                    result({
                        success: false,
                        status: 404,
                        message: dataFile.message,
                        link: ''
                    });
                }
            } catch (error) {
                console.log('error aws imagen = ', error);
                reject({
                    ok: false,
                    status: 500,
                    msg: 'Error de servidor subiendo Imagen',
                })
            }
        })
    }

    /**
     * 
     * @param fileKey clave de string asociada al archivo a eliminar
     * @returns {AwsResponse} respuesta con resultado de la operacion de eliminacion del archivo
     */
    removeFile(fileKey: string): Promise<AwsResponse> {
        return new Promise(async (result, reject) => {
            try {
                
                const image = {
                    Bucket: process.env.AWS_BUCKET,
                    Key: `${fileKey}`,
                }
            
                const command = new DeleteObjectCommand(image);
                const response: DeleteObjectCommandOutput = await this.client.send(command);
    
                const res = response['$metadata'];
    
                if(res.httpStatusCode == 204){
                    result({
                        success: true,
                        status: 200,
                        message: 'File removed successfully',
                        link: ''
                    })
                } else {
                    result({
                        success: false,
                        status: res.httpStatusCode || 400,
                        message: 'File Not Found: We couldnt delete the file',
                        link: ''
                    })
                }
    
            } catch (error) {
                reject({
                    ok: false,
                    msg: 'Cloud Error: We couldnt delete the file'
                })
            }
        })
    }

    /**
     * 
     * @param files {Files[]} Array de archivos a Subir a AWS
     * @returns {string[]} respuesta con resultado y array de links de acceso a las imagenes
     */

    //TODO: Existe el metodo multipart para subida de varios objetos a aws, aqui se usa el metodo upload de esta misma clase, pero se podria usar el multipart de AWS nativo
    multiImagesUpload(files: Express.Multer.File[]): Promise<string[]>{

        return new Promise(async (result, reject) => {
    
            try {
                const count = files.length;
                const fileArray: string[] = [];
    
                for(let i = 0; i < count; i++) {

                    const nameArray: string[] = files[i].filename.split('.');
                    const ext: string = nameArray[ nameArray.length - 1 ];

                    const type: TypeFile = this.getTypeOfExtension(ext)

                    let fileUpload = await this.uploadFile(files[i], type);
            
                    if(fileUpload.success){
                        fileArray.push(fileUpload.link);
                    }
                }
    
                result(fileArray);
    
            } catch (error) {
                console.log('error multi imagen = ', error);
                reject(error)
            }
        })
    }

    multiFilesUpload(files: Express.Multer.File[]): Promise<FileDataSave[]>{

        return new Promise(async (result, reject) => {
    
            try {
                const count = files.length;
                const fileArray: FileDataSave[] = [];
    
                for(let i = 0; i < count; i++){

                    const nameArray: string[] = files[i].filename.split('.');
                    const ext: string = nameArray[ nameArray.length - 1 ];

                    const type: TypeFile = this.getTypeOfExtension(ext)

                    let fileUpload = await this.uploadFile(files[i], type);
            
                    if(fileUpload.success){
                        fileArray.push({
                            type: type,
                            name: files[i].originalname,
                            fieldName: files[i].fieldname,
                            link: fileUpload.link
                        });
                    }
                }
    
                result(fileArray);
    
            } catch (error) {
                console.log('error multi imagen = ', error);
                reject(error)
            }
        })
    }
 



    /**
     * Comprueba si la extension y el tipo del archivo concuerdan con los formatos establecidos, retorna un objeto con la data necesaria para las acciones CRUD de AWS relacionadas con dicho archivo
     * @param type Tipo de archivo seleccionado
     * @param fileName Nombre del archivo con extension, sobre la cual se realizara la evaluacion de extenxion = tipoww
     * @returns {DataForFile}
     */
    private extensionValidator(type: TypeFile, fileName: string): 
    Promise<DataForFile> {

        return new Promise((result, reject) => {
            try {

                const nameArray: string[] = fileName.split('.');
                const ext: string = nameArray[ nameArray.length - 1 ];

                let response: DataForFile = {
                    success: false,
                    folder: '',
                    contentType: 'application/xml',
                    message: 'success'
                }

                console.log('extension validator aws = ', type)

                switch (type) {
                    case 'excel':
        
                        if(this.excelExtensionsAvaliable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/vnd.ms-excel'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
        
                        break;
        
                     case 'image':

                        if(this.imageExtensionsAvailable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'image/jpeg'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }

                        
                        break;
        
                    case 'application':

                        if(this.pdfExtensionsAvailable.includes(ext)){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'application/pdf'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
                        
                        break;
        
                    case 'word':

                        if(this.wordExtensionsAvaliable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'text/plain'

                            result(response)

                        } else {

                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
                        
                        break;

                    case 'video':
        
                        if(this.videoExtensionsAvaliable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType =`video/${ext}`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
        
                        break;

                    case 'audio':
        
                        if(this.audioExtensionsAvaliable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType =`audio/${ext}`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
        
                        break;

                    case 'presentation':
        
                        if(this.audioExtensionsAvaliable.includes( ext )){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType =`application/vnd.ms-powerpoint`

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`
                            result(response)
                        }
        
                        break;
                    
                    case 'other':

                        if( ext === type ){

                            response.success = true;
                            response.folder = this.selectFolder[type];
                            response.contentType = 'text/html'

                            result(response)

                        } else {
                            response.message = `Extension ${ext} Not valid in type ${type}`;
                            result(response)
                        }
                        
                        break;
                    
                
                    default:
                        response.message = `Extension ${ext} not valid in any kind`;
                        result(response)

                        break;
                }
                
            } catch (error) {
                reject('Error Get folder to file')
            }
        })
        
    }

    /**
     * Toma la extension del archivo y retorna el tipo al que pertenece segun la lista de tipos de extensiones habilitadas
     * @param ext Extension del archivo a evaluar
     * @returns {TypeFile} Type del archivo a guardar
     */
    getTypeOfExtension(ext: string): TypeFile {

        if(this.imageExtensionsAvailable.includes(ext)){
            return 'image'
        }

        if(this.excelExtensionsAvaliable.includes(ext)){
            return 'excel'
        }

        if(this.wordExtensionsAvaliable.includes(ext)){
            return 'word'
        }

        if(this.videoExtensionsAvaliable.includes(ext)){
            return 'video'
        }

        if(this.audioExtensionsAvaliable.includes(ext)){
            return 'audio'
        }

        if(this.presentationsExtensionsAvaliable.includes(ext)){
            return 'presentation'
        }

        if(this.pdfExtensionsAvailable.includes(ext)){
            return 'application'
        }

        return 'other'
    }

}