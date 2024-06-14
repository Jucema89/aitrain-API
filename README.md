<p align="center">
  <a href="https://strapi.io/#gh-light-mode-only">
    <img src="https://aitrain.app/assets/img/Aitrain-logo.png" width="218px" alt="Aitrain logo" />
  </a>
  <a href="https://strapi.io/#gh-dark-mode-only">
    <img src="https://aitrain.app/assets/img/Aitrain-logo-color-white.png" width="218px" alt="Aitrain logo" />
  </a>
</p>

<h3 align="center">Backend para Finetuning Open Source.</h3>
<p align="center">Transforma los documentos de tu empresa o negocio en documentos validos para que la IA aprenda, corriendo en local sin comprometer información sensible</p>
<p align="center"><a href="https://aitrain.app/">App Produccion</a>  · <a href="https://hub.docker.com/r/juliodaza/aitrain-backend">Imagen Docker Backend</a> </p>
<br />


<br>

<p align="center">
  <a href="https://strapi.io">
    <img src="https://aitrain.app/assets/img/Aitrain_project.png" alt="Aitrain Preview Project" />
  </a>
</p>
<br>

## Flujo de la API
El objetivo principal es crear los archivos **.jsonl** en el schema exigido por OpenAI para Finetuning, en esta imagen vemos en macro el flujo de los datos y las transformaciones.

```mermaid
graph LR
Z[Aitrain] --> A
A[Documentos] -- LangChain Embedding --> B((OpenAI))
Z --Las Q&A se formatean en files validos--> Y
Y[Files .jsonl] --> D
B --> C(Genera Q&A para .jsonl)
C -- Q&A para creación de Files --> Z
B --> D(Hacer Finetuning de Modelo)
```

### Fases del Finetuning de Modelos
1.  Tomamos los archivos que nos envía el cliente y los fragmentamos en chuncks con los Splitters que provee Langchain para cada tipo de archivo.
2. Transformamos los Chuncks en Embedding usando el modelo *"text-embedding-3-small"* de OpenAI, para posteriormente guardarlos en *MemoryVectorStore*( base de datos vectorial en memoria)
3. Usando Langchain y los Embeddings se crea un ciclo iterativo de generación de (Q&A) preguntas y respuestas basado en el modelo de IA enviado por el cliente y el chunck que se itera.
4. Después de iterados los datos y creadas las Q&A se usa el FileSystem de Node para crear los archivos validos para entrenamiento. 
5. Por ultimo se conecta a la API de OpenAI y crea un Job de Finetuning. Este proceso demora de minutos a horas, segun la disponibilidad de los servers de OpenAI y de la cantidad de Q&A generadas.

## Correr en local
Necesitaras las versión de Node 20 o superior, se usa Langchain.js y al ser una implementacion de esta libreria original de Python requerira Python tambien. Ademas usa utilidades como **Make** o **G++**, por esto se recomienda correrlo en local dentro de una maquina Linux o en un WSL2 en Windows para facilitar estas instalaciones.

### Base de datos
Aitrain API usa [Postgres](https://www.postgresql.org/) como base de datos y a [Prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql) como ORM de comunicacion y manejo de Schemas. Se recomienda usar una Imagen de Docker de Postgres y crear un contenedor.

### Instalacion del proyecto
Para instalar el proyecto deberas contar con [git](https://www.git-scm.com/) en tu maquina, abres una consola y ejecutar estos comandos:

`git clone git@github.com:Jucema89/aitrain-API.git`
`npm i`
`npx  prisma  generate`
`npm run dev`

Recuerda crear el archivo `.env` en la raiz del proyecto, necesitaras estas variables de entorno. Las de AWS no son requeridas.
```
ENVIRONMENT='develop'
PORT_EXPRESS=3900
BACK_NODE_URL='http://localhost:3900'
DATABASE_URL="postgresql://usuario-postgres:pass-user@localhost:6432/aitrain"
AWS_ACCESS_KEY_ID=ABCDEFG
AWS_SECRET_ACCESS_KEY=XXXXxxxXXxXXXx
AWS_BUCKET=my-bucket
AWS_BUCKET_REGION=us-east-2
```

## Como usarlo desde la WebApp

Copia el docker compose y ejecutalo: Con el archivo se bajara la ultima imagen de **aitrain-backend** y se crearan dos servicios: uno con la base de datos de Postgres y la otra con el backend de Node, por defecto corre en el puerto 3900. Te diriges a la web de [Aitrain app](https://aitrain.app/) y en la sección de configuración colocas la url de backend y la Api Key que generas en [OpenAi](https://platform.openai.com/api-keys) ya con eso puedes generar los documentos .jsonl para entrenamiento y luego con ellos entrenar la IA de OpenAI.
> **Nota:** De momento solo **GPT-3.5** y sus versiones son las habilitadas para Finetuning.

            ##docker-compose.yml
            version: '3.8'
            services:

              db:
                image: postgres
                environment:
                  POSTGRES_DB: aitrain
                  POSTGRES_USER: postgres
                  POSTGRES_PASSWORD: aitrainPass
                ports:
                  - "6432:5432"
                volumes:
                  - postgres_data:/var/lib/postgresql/data

              app:
                image: juliodaza/aitrain-backend:latest
                ports:
                  - "3900:3900"
                environment:
                  DATABASE_URL: "postgresql://postgres:aitrainPass@db:5432/aitrain"
                depends_on:
                  - db

            volumes:
              postgres_data:

