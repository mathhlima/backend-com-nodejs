const express = require('express');
const { uuid, isUuid}  = require('uuidv4');

const app = express();

app.use(express.json());

const projects = [];

function logRequests(request, response, next){
    const {method, url} = request;

    const logLabel = `[${method.toUpperCase()}] ${url}`;

    console.log(logLabel);

    return next(); //precisa chamar o next no final middleware se nao, o proximo
                   //se nao o proximo middleware nao é disparada
}

function validateProjectId(request, response, next){
    const {id} = request.params;

    if(!isUuid(id)){
        return response.status(400).json({error: 'invalid project id'})
        //se o id for invalido, retorna o response error, e nao next, logo
        //a requisição será interrompida
    }

    return next(); //next irá ser disparado, caso a validacao de certo
                    
}

app.use(logRequests);
app.use('/projects/:id', validateProjectId)

app.get('/projects', (request, response) => {
    
    const {title} = request.query;

    const results = title
        ? projects.filter(project => project.filter.includes(title))
        : projects;


    return response.json(projects);
});

app.post('/projects', (request, response) => {
    
    const {title, owner} = request.body;
    const project = {id: uuid(),title, owner};

    projects.push(project)

    return response.json(project)
});

app.put('/projects/:id', (request, response) => {
    const { id, title, owner } = request.params;

    const projectIndex = projects.findIndex(project => project.id === id);

    if(projectIndex < 0){
        return response.status(400).json({error: 'project not found.'})
    }

    const project = {
        id,
        title,
        owner
    };

    projects[projectIndex] = project;

    return response.json(project)
});

app.delete('/projects/:id', (request, response) => {
    const {id} = request.params;

    const projectIndex = projects.findIndex(project => project.id === id);

    if(projectIndex < 0){
        return response.status(400).json({error: 'project not found.'})
    }

    projects.splice(projectIndex, 1);

    return response.status(204).send();

});

app.listen(3333, () => {
    console.log('Back-end started!');
});

