const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 3001;

// Fonction pour récupérer la structure des dossiers
function getFolderStructure(dirPath) {
    console.log('Scanner le dossier :', dirPath);

    if (!fs.existsSync(dirPath)) {
        console.error('Le dossier n\'existe pas ou ne peut pas être accédé :', dirPath);
        return [];
    }

    const items = fs.readdirSync(dirPath);
    console.log('Éléments trouvés dans', dirPath, items);

    return items.map(item => {
        const itemPath = path.join(dirPath, item);
        const isDirectory = fs.lstatSync(itemPath).isDirectory();

        let structureItem = {
            type: isDirectory ? 'dossier' : 'fichier',
            name: item,
            contenu: []
        };

        if (isDirectory) {
            // Chercher l'image dans le dossier 'config2850/picture'
            const pictureDir = path.join(itemPath, 'config2850', 'picture');
            let imageUrl = '';

            if (fs.existsSync(pictureDir)) {
                const filesInPictureDir = fs.readdirSync(pictureDir);
                // Rechercher des images (vous pouvez ajuster les extensions que vous cherchez)
                const imageFile = filesInPictureDir.find(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

                if (imageFile) {
                    imageUrl = `/apifolders/${item}/config2850/picture/${imageFile}`;
                }
            }

            structureItem.imageUrl = imageUrl;  // Ajout de l'image pour la carte
            const indexPath = path.join(itemPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                structureItem.url = `/apifolders/${item}/index.html`;
            }
            structureItem.contenu = getFolderStructure(itemPath);
        }

        return structureItem;
    });
}
// 
app.get('/', (req, res) => {
    const folderStructure = getFolderStructure(path.join(__dirname, '../apifolders'));

    let cardsHtml = '';

    folderStructure.forEach(item => {
        if (item.type === 'dossier') {
            const appUrl = `/app/${item.name}`;
            const imageUrl = item.imageUrl ? `background-image: url('${item.imageUrl}');` : '';  // Si une image existe

            // Génération du HTML pour chaque carte
            cardsHtml += `
                <div class="card" style="${imageUrl}">
                    <a href="${appUrl}">
                        <h2>${item.name}</h2>
                        <p>Voir la structure de l'application</p>
                    </a>
                </div>
            `;
        }
    });

    const htmlContent = `
        <style>
            .card-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }
            .card {
                width: 20vw;
                height: 20vw;
                margin: 1vw;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                background-color: #ccc;
                border-radius: 8px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease-in-out;
                background-size: cover; /* Pour ajuster l'image de fond */
                background-position: center; /* Centrer l'image */
            }
            .card h2 {
                font-size: 1.5rem;
                color: white;  /* Assurez-vous que le texte est visible */
            }
            .card p {
                font-size: 1rem;
                color: #fff;
            }
            .card:hover {
                transform: scale(1.05);
            }
        </style>

        <p>Voici la liste des applications disponibles :</p>
        <div class="card-container">
            ${cardsHtml}
        </div>
    `;

    res.send(htmlContent);
});



// Route pour afficher la structure d'un dossier spécifique
app.get('/app/:appName', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);

    // Vérifier si le dossier existe
    if (!fs.existsSync(appPath)) {
        return res.status(404).send('Application non trouvée');
    }

    // Récupérer la structure de l'application choisie
    const folderStructure = getFolderStructure(appPath);

    let htmlContent = `<h1>Structure de l'application: ${appName}</h1><ul>`;

    // Fonction récursive pour afficher les fichiers et sous-dossiers
    const generateFolderStructure = (folder) => {
        if (folder.type === 'dossier') {
            htmlContent += `<li><strong>${folder.name}</strong><ul>`;
            folder.contenu.forEach(item => {
                if (item.type === 'dossier') {
                    htmlContent += `<li><a href="/app/${appName}/${folder.name}/${item.name}">${item.name}</a></li>`;
                    generateFolderStructure(item);  // Appel récursif pour sous-dossiers
                } else if (item.type === 'fichier') {
                    htmlContent += `<li><a href="/app/${appName}/${folder.name}/${item.name}">${item.name}</a></li>`;
                }
            });
            htmlContent += '</ul></li>';
        }
    };

    // Générer la structure pour chaque dossier
    folderStructure.forEach(item => generateFolderStructure(item));

    htmlContent += '</ul>';
    res.send(htmlContent);
});

// Middleware pour servir des fichiers dynamiquement depuis tous les dossiers dans 'apifolders'
fs.readdirSync(path.join(__dirname, '../apifolders')).forEach(folder => {
    const folderPath = path.join(__dirname, '../apifolders', folder);

    // Vérifie que c'est bien un dossier
    if (fs.lstatSync(folderPath).isDirectory()) {
        app.use(`/apifolders/${folder}`, express.static(folderPath));
    }
});

// Route pour récupérer le contenu d'un fichier spécifié par son chemin
app.get('/file-content', (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) {
        return res.status(400).send('Chemin du fichier non spécifié');
    }

    const absoluteFilePath = path.join(__dirname, '../apifolders', filePath);
    fs.stat(absoluteFilePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).send('Fichier introuvable');
        }
        const mimeType = mime.lookup(absoluteFilePath) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        const readStream = fs.createReadStream(absoluteFilePath);
        readStream.pipe(res);
    });
});

// Serveur Node.js en écoute
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

module.exports = app;
