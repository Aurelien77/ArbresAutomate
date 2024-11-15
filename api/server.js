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
            const pictureDir = path.join(itemPath, 'config2850', 'pictures2850');
            let imageUrl = '';

            if (fs.existsSync(pictureDir)) {
                const filesInPictureDir = fs.readdirSync(pictureDir);
                // Rechercher des images (vous pouvez ajuster les extensions que vous cherchez)
                const imageFile = filesInPictureDir.find(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

                if (imageFile) {
                    imageUrl = `/apifolders/${item}/config2850/pictures2850/${imageFile}`;
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

// Route principale pour afficher les applications (accueil)
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

// Route principale pour l'application avec menu et iframe
app.get('/app/:appName', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);

    if (!fs.existsSync(appPath)) {
        return res.status(404).send('Application non trouvée');
    }

    // On garde seulement le menu et l'iframe
    const htmlContent = `
       <style>
        .menu {
            display: flex;
            background-color: white;
            justify-content: center;
            gap: 15px;
            align-items: center;
            padding: 10px;
        }
        .menu h1 {
            margin-right: 20px;
            font-size: 1.5rem;
            color: #333;
        }
        .menu button {
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }
        .menu button:hover {
            background-color: #0056b3;
        }
        iframe {
            width: 100%;
            height: 600px;
            border: 1px solid #ddd;
            margin-top: 20px;
        }
       </style>
       <div class="menu">
           <h1>${appName}</h1>
           <button onclick="loadPage('/app/${appName}/config2850/middle')">🗝️ Middle</button>
           <button onclick="loadPage('/app/${appName}/folders/end')">🗝️ BD</button>
           <button onclick="loadPage('/app/${appName}/config2850/observations')">🖊️ Obs</button>
           <button onclick="loadPage('/app/${appName}/folders')">Arbre</button>


       </div>
       <iframe id="content-frame" src="/app/${appName}/folders" frameborder="0"></iframe>
       <script>
           function loadPage(url) {
               document.getElementById('content-frame').src = url;
           }
       </script>
    `;

    res.send(htmlContent);
});
// Route pour afficher les fichiers de middle
app.get('/app/:appName/config2850/middle', (req, res) => {
    const appName = req.params.appName;
    const middlePath = path.join(__dirname, '../apifolders', appName, 'config2850', 'middle');

    // Vérifiez si le répertoire existe et renvoyer son contenu
    if (fs.existsSync(middlePath) && fs.lstatSync(middlePath).isDirectory()) {
        const items = fs.readdirSync(middlePath);

        let htmlContent = '<ul>';
        items.forEach(item => {
            htmlContent += `<li><a href="/app/${appName}/config2850/middle/${item}">${item}</a></li>`;
        });
        htmlContent += '</ul>';

        res.send(htmlContent);
    } else {
        res.status(404).send('Dossier "middle" non trouvé');
    }
});

// Route pour afficher les fichiers d'observation
app.get('/app/:appName/config2850/observations', (req, res) => {
    const appName = req.params.appName;
    const middlePath = path.join(__dirname, '../apifolders', appName, 'config2850', 'observations');

    // Vérifiez si le répertoire existe et renvoyer son contenu
    if (fs.existsSync(middlePath) && fs.lstatSync(middlePath).isDirectory()) {
        const items = fs.readdirSync(middlePath);

        let htmlContent = '<ul>';
        items.forEach(item => {
            htmlContent += `<li><a href="/app/${appName}/config2850/observations/${item}">${item}</a></li>`;
        });
        htmlContent += '</ul>';

        res.send(htmlContent);
    } else {
        res.status(404).send('Dossier "observations" non trouvé');
    }
});

// Route pour afficher la structure des dossiers dans l'iframe (racine)
app.get('/app/:appName/folders', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);

    if (!fs.existsSync(appPath) || !fs.lstatSync(appPath).isDirectory()) {
        return res.status(404).send('Dossier non trouvé');
    }

    const folderStructure = getFolderStructure(appPath);

    let htmlContent = '<ul>';

    const generateFolderStructure = (folder, currentPath = '') => {
        if (folder.type === 'dossier') {
            htmlContent += `<li><strong>${folder.name}</strong><ul>`;
            folder.contenu.forEach(item => {
                if (item.type === 'dossier') {
                    const newPath = path.join(currentPath, folder.name, item.name).replace(/\\/g, '/'); // assure le format URL
                    htmlContent += `<li><a href="#" onclick="loadPage('/app/${appName}/folders/${newPath}')">${item.name}</a></li>`;
                } else if (item.type === 'fichier') {
                    htmlContent += `<li>${item.name}</li>`;
                }
            });
            htmlContent += '</ul></li>';
        }
    };

    folderStructure.forEach(item => generateFolderStructure(item));
    htmlContent += '</ul>';

    res.send(`
        <style>
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin: 5px 0;
                font-family: Arial, sans-serif;
            }
            a {
                text-decoration: none;
                color: #007bff;
                cursor: pointer;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
        ${htmlContent}
    `);
});

// Middleware pour servir des fichiers dynamiquement depuis tous les dossiers dans 'apifolders'
fs.readdirSync(path.join(__dirname, '../apifolders')).forEach(folder => {
    const folderPath = path.join(__dirname, '../apifolders', folder);

    // Vérifie que c'est bien un dossier
    if (fs.lstatSync(folderPath).isDirectory()) {
        app.use(`/apifolders/${folder}`, express.static(folderPath));
    }
});

// Route pour récupérer le contenu d'un fichier dans un dossier
app.get('/app/:appName/folders/*', (req, res) => {
    const appName = req.params.appName;
    const filePath = path.join(__dirname, '../apifolders', appName, req.params[0]);

    if (fs.existsSync(filePath)) {
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).send('Fichier non trouvé');
    }
});

app.listen(port, () => {
    console.log(`Le serveur tourne sur http://localhost:${port}`);
});


module.exports = app;
