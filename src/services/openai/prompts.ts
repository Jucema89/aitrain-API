import { TypeAnswer } from "../../interfaces/training.interface";

const CREATE_PROMPT_ALLS = `
Sobre el texto entregado por el usuario vas a crear dos preguntas con respuestas,  las preguntas deben ser de mínimo 100 caracteres y máximo 250 caracteres, las preguntas deben ser diferentes la uan de la otra, aunque traten el mismo tema. Las respuestas deben ser copia exacta del texto tal como esta escrito en el documento. La primera respuesta debe ser de maximo 450 caracteres, la segunda respuesta sera de mas caracteres. Puedes agregar o disminuir palabras para conservar estos limites, sin alterar el contenido y sentido del texto. Debes replicar el tono, tecnicismos y lenguaje usado en el documento.
`
const CREATE_PROMPT_SHORT = `
Sobre el texto entregado por el usuario vas a crear dos preguntas con respuestas,  las preguntas deben ser de mínimo 100 caracteres y máximo 250 caracteres, las preguntas deben ser diferentes la uan de la otra, aunque traten el mismo tema. Las respuestas deben ser copia exacta del texto tal como esta escrito en el documento. Las respuestas deben ser de maximo 350. Puedes agregar o disminuir palabras para conservar estos limites, sin alterar el contenido y sentido del texto. Debes replicar el tono, tecnicismos y lenguaje usado en el documento.
`
const CREATE_PROMPT_LONG = `
Sobre el texto entregado por el usuario vas a crear dos preguntas con respuestas,  las preguntas deben ser de mínimo 100 caracteres y máximo 250 caracteres, las preguntas deben ser diferentes la una de la otra, aunque traten el mismo tema. Las respuestas deben ser copia exacta del texto tal como esta escrito en el documento. La primera respuesta debe ser de mas de 550 caracteres. Puedes agregar palabras para ampliar-explicar el contenido del texto, sin alterar el contenido y sentido del texto. Debes replicar el tono, tecnicismos y lenguaje usado en el documento.
`

//Tu Respuesta incluira las 2 preguntas con sus respuestas y sera un Array de JSON asi: [{ pregunta: '', respuesta: '' }, { pregunta: '', respuesta: '' }]

export function createPrompt(type: TypeAnswer): string {
    switch (type) {
        case 'alls':
            return CREATE_PROMPT_ALLS
            break;
    
        case 'short':
            return CREATE_PROMPT_SHORT
            break;

        case 'long_explained':
            return CREATE_PROMPT_LONG
            break;
    }
}