const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 3001;
// Fonction pour récupérer les images dans un dossier
function getImagesFromFolder(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        return files.filter(file => {
            // Vérifier si le fichier est une image en fonction de son extension
            return /\.(jpg|jpeg|png|gif|bmp)$/i.test(file);
        });
    } catch (err) {
        console.error(`Erreur lors de la lecture du dossier ${folderPath}:`, err);
        return [];  // Retourner un tableau vide en cas d'erreur
    }
}
// Fonction pour récupérer la structure des dossiers
function getFolderStructure(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.error('Le dossier n\'existe pas ou ne peut pas être accédé :', dirPath);
        return [];
    }

    const items = fs.readdirSync(dirPath);
    return items.map(item => {
        const itemPath = path.join(dirPath, item);
        const isDirectory = fs.lstatSync(itemPath).isDirectory();

        let structureItem = {
            type: isDirectory ? 'dossier' : 'fichier',
            name: item,
            contenu: []
        };

        if (isDirectory) {
            structureItem.contenu = getFolderStructure(itemPath);
        }

        return structureItem;
    });
}


app.use('/app/:appName/config2850/pictures2850', (req, res, next) => {
    const appName = req.params.appName;
    const pictureFolderPath = path.join(__dirname, '../apifolders', appName, 'config2850', 'pictures2850');

    if (!fs.existsSync(pictureFolderPath)) {
        return res.status(404).send('Le dossier des images n\'existe pas');
    }

    express.static(pictureFolderPath)(req, res, next);
});

app.get('/', (req, res) => {
    const folderStructure = getFolderStructure(path.join(__dirname, '../apifolders'));

    let cardsHtml = '';
    folderStructure.forEach(item => {
        if (item.type === 'dossier') {
            const appUrl = `/app/${item.name}`;
            const imageFolderPath = path.join(__dirname, '../apifolders', item.name, 'config2850', 'pictures2850');
    
            // Liste des fichiers image dans le dossier
            const images = getImagesFromFolder(imageFolderPath);
            let imageUrl = '';
    
            if (images.length > 0) {
                // Utiliser la première image trouvée dans le dossier comme image de fond
                imageUrl = `/app/${item.name}/config2850/pictures2850/${images[0]}`;
            }
    
            // Ajouter l'image comme fond d'écran pour la carte
            cardsHtml += `
                <div class="card" style="background-image: url('${imageUrl}');">
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
                background-size: cover;
                background-position: center;
            }
            .card h2 {
                font-size: 1.5rem;
                color: white;
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


app.use('/app/:appName/config2850', express.static(path.join(__dirname, '../apifolders')));





// Route principale pour l'application avec menu et iframe
app.get('/app/:appName', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);

    if (!fs.existsSync(appPath)) {
        return res.status(404).send('Application non trouvée');
    }

    // Générer dynamiquement les boutons de menu basés sur les sous-dossiers dans config2850
    const configPath = path.join(appPath, 'config2850');
    const configDirs = fs.existsSync(configPath) ? fs.readdirSync(configPath).filter(item => fs.lstatSync(path.join(configPath, item)).isDirectory()) : [];

    const menuButtonsHtml = configDirs.map(dir => {
        return `<button onclick="loadPage('/app/${appName}/config2850/${dir}')">${dir}</button>`;
    }).join(' ');

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
           ${menuButtonsHtml}
            <button onclick="loadPage('/app/${appName}/config2850')">Arbre</button>  
       </div>
       <iframe id="content-frame" src="/app/${appName}/config2850" frameborder="0"></iframe>
       <script>
           function loadPage(url) {
               document.getElementById('content-frame').src = url;
           }
       </script>
    `;

    res.send(htmlContent);
});

// Route pour afficher le contenu des sous-dossiers dans l'iframe (par défaut dans config2850)
app.get('/app/:appName/config2850', (req, res) => {
    const appName = req.params.appName;
    const configPath = path.join(__dirname, '../apifolders', appName, 'config2850');
    const configDirs = fs.existsSync(configPath) ? fs.readdirSync(configPath).filter(item => fs.lstatSync(path.join(configPath, item)).isDirectory()) : [];

    let htmlContent = '<ul>';

    configDirs.forEach(dir => {
        htmlContent += `<li><a href="#" onclick="loadPage('/app/${appName}/config2850/${dir}')">${dir}</a></li>`;
    });

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

// Route pour afficher le contenu d'un fichier ou d'un dossier spécifique dans config2850
app.get('/app/:appName/config2850/:dirName', (req, res) => {
    const { appName, dirName } = req.params;
    const dirPath = path.join(__dirname, '../apifolders', appName, 'config2850', dirName);

    if (!fs.existsSync(dirPath)) {
        return res.status(404).send('Dossier non trouvé');
    }

    // Si c'est un fichier, le renvoyer
    const stats = fs.lstatSync(dirPath);
    if (stats.isFile()) {
        const fileType = mime.lookup(dirPath);
        res.type(fileType);
        return res.sendFile(dirPath);
    }

    // Si c'est un dossier, afficher son contenu
    const folderStructure = getFolderStructure(dirPath);
    let htmlContent = '<ul>';

    folderStructure.forEach(item => {
        if (item.type === 'dossier') {
            htmlContent += `<li><a href="#" onclick="loadPage('/app/${appName}/config2850/${dirName}/${item.name}')">${item.name}</a></li>`;
        } else {
            htmlContent += `<li>${item.name}</li>`;
        }
    });

    htmlContent += '</ul>';

    res.send(htmlContent);
});

app.listen(port, () => {
    console.log(`Le serveur tourne sur http://localhost:${port}`);
});