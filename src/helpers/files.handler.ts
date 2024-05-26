import fs from 'fs';

/**
 * 
 * @param path route when file exist
 * @returns 
 */
export function removeLocalFile(path: string): Promise<boolean>{
    return new Promise(async(result, reject) => {
        try {

            fs.unlink(path, (err) => {
                if (err) {
                  console.error(err)
                  reject('no se pudo eliminar file');
                }
                result(true)
            })
            
        } catch (error) {
            reject('Error remove File');
            console.log('Error Remove File = ', error)
        }
    })
}