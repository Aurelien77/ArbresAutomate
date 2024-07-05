const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the Projet directory
app.use(express.static(path.join(__dirname, '../projet/tree')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/file-content', (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
        res.status(400).send('Chemin du fichier non spécifié');
        return;
    }

    const absoluteFilePath = path.join(__dirname, '../projet/tree', filePath);

    fs.stat(absoluteFilePath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.error('Erreur lors de la lecture du fichier :', err);
            res.status(404).send('File not found');
            return;
        }

        const mimeType = mime.lookup(absoluteFilePath) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);

        const readStream = fs.createReadStream(absoluteFilePath);
        readStream.pipe(res);
    });
});

app.get('/folder-structure', (req, res) => {
    const folderStructure = getFolderStructure(path.join(__dirname, '../projet/tree'));
    res.json(folderStructure);
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

function getFolderStructure(dirPath) {
    const items = fs.readdirSync(dirPath);
    return items.map(item => {
        const itemPath = path.join(dirPath, item);
        const isDirectory = fs.lstatSync(itemPath).isDirectory();
        return {
            type: isDirectory ? 'dossier' : 'fichier',
            name: item,
            contenu: isDirectory ? getFolderStructure(itemPath) : []
        };
    });
}

module.exports = app;
