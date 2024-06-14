const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Fonction pour récupérer l'arborescence des fichiers
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

// Route pour servir les fichiers statiques
app.use(express.static('public'));

// Route pour la racine
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Route pour récupérer le contenu d'un fichier
app.get('/file-content', (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
        res.status(400).send('Chemin du fichier non spécifié');
        console.log(`Requête reçue : ${req.method} ${req.url}`);
        console.log(filePath, "FILE PATH OK")
        return;
    }

    const absoluteFilePath = path.join(__dirname, filePath);

    fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier :', err);
            res.status(404).send('File not found');
        } else {
            console.log('Fichier lu avec succès :', absoluteFilePath);
            res.send(data);
        }
    });
});

// Route pour récupérer la structure des dossiers
app.get('/folder-structure', (req, res) => {
    const folderStructure = getFolderStructure('./'); // Chemin de votre répertoire racine
    res.json(folderStructure);
    console.log(`Requête reçue : ${req.method} ${req.url}`);
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
