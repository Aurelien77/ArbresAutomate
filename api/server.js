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
        return `<button onclick="loadPage('/app/${appName}/config2850/${dir}')" data-url="/app/${appName}/config2850/${dir}">📁${dir}</button>
`;
    }).join(' ');

    const htmlContent = `
      <style>
      
       .iframeview {
    display: flex;
    gap: 10px; /* Espacement entre les iframes */
}

.iframeview iframe {
    flex: 1;
    height: 600px;
    border: 1px solid #ddd;
}
    h1{
    color:white;
    }
    .toggleMenuButton {
        position: fixed;
        top: 5px;
        right: 20px;
        width: 30px;
        height: 30px;
        font-size: 20px;
        background-color: #4CAF50; /* Couleur verte */
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 100;
        transition: transform 0.3s ease-in-out;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.6); /* Effet lumineux */
    }

    .toggleMenuButton:hover {
        background-color: #45a049;
        box-shadow: 0 0 20px rgba(0, 255, 0, 1); /* Effet lumineux au survol */
        transform: scale(1.1); /* Légère agrandissement au survol */
    }

    /* Menu caché par défaut */
    .categoryMenu {
        position: fixed;
        top: -150px; /* Hors de l'écran en haut */
        left: 0;
        width: 100%; /* Le menu prend toute la largeur */
        height: 150px; /* Hauteur du menu */
        background-color: #333; /* Couleur sombre pour le fond */
        transition: top 0.3s ease-in-out; /* Animation pour le déploiement */
        z-index: 50;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Ombre pour le menu */
    }

    .categoryMenu a {
        display: block;
        padding: 12px;
        color: white;
        text-decoration: none;
        font-size: 16px;
        transition: background-color 0.3s;
    }

    .categoryMenu a:hover {
        background-color: #575757; /* Effet hover des liens du menu */
    }

    /* Activer le menu lorsqu'il est ouvert */
    .categoryMenu.active {
        top: 0; /* Déplace le menu vers le haut */
    }

    /* Style pour le contenu principal */
    iframe {
        width: 100%;
        height: 600px;
        border: 1px solid #ddd;
        margin-top: 20px;
    }
        #content-frame {
          margin-top: 35px;
        }
          #titre{
         margin-top: 110px;
          }
</style>
       <button id="toggleMenuButton" class="toggleMenuButton">☰</button>

     <div id="categoryMenu" class="categoryMenu">
          
           ${menuButtonsHtml}
    
            <button onclick="loadPage('/app/${appName}/config2850')">Arbre</button>  
                    <h1 id="titre" >${appName}</h1>
       </div>
       <div class="iframeview">
       <iframe id="content-frame" src="/app/${appName}/config2850" frameborder="0"></iframe>
 <iframe id="content-frame-view" src="" frameborder="0"></iframe>
<div>
  <script>
  // Fonction pour charger une page dans l'iframe appropriée
  function loadPage(url, type = 'dossier') {
    const iframeView = document.getElementById('content-frame-view');
    const iframe = document.getElementById('content-frame');

    if (type === 'fichier') {
        // Vérification du type MIME et chargement approprié
        fetch(url)
            .then(response => {
                const contentType = response.headers.get("Content-Type");
                if (contentType.includes("image") || contentType.includes("video") || contentType.includes("audio")) {
                    // Si c'est une image, vidéo ou audio, afficher dans l'iframe
                    iframeView.src = url; // Charger l'image ou fichier multimédia
                } else if (contentType.includes("application/pdf")) {
                    // Si c'est un PDF, on peut l'afficher dans l'iframe
                    iframeView.src = url;
                } else {
                    // Si c'est un autre type de fichier (texte, etc.), on peut l'ouvrir dans une nouvelle page ou iframe
                    iframeView.src = url; 
                }
            })
            .catch(error => console.error('Erreur lors du chargement du fichier:', error));
    } else {
        // Si c'est un dossier, charger la structure du dossier
        iframe.src = url; // Charger le dossier dans la première iframe
    }
  }

  // Fonction pour basculer l'affichage du menu
  const toggleMenuButton = document.getElementById('toggleMenuButton');
  const categoryMenu = document.getElementById('categoryMenu');

  toggleMenuButton.addEventListener('click', function () {
      categoryMenu.classList.toggle('active');
  });

  // Fermer le menu après clic sur un bouton
  const menuButtons = document.querySelectorAll('.categoryMenu button');
  menuButtons.forEach(button => {
      button.addEventListener('click', () => {
          categoryMenu.classList.remove('active');
      });
  });
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
        htmlContent += `<li><a href="#" onclick="loadPage('/app/${appName}/config2850/${dir}', 'dossier')">📁${dir}</a></li>`;
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

app.get('/app/:appName/config2850/:dirName/:fileName?', (req, res) => {
    const { appName, dirName, fileName } = req.params;
    const basePath = path.join(__dirname, '../apifolders', appName, 'config2850', dirName);

    let filePath = basePath;
    if (fileName) {
        filePath = path.join(basePath, fileName);
    }

    // Vérifier l'existence du fichier ou dossier
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Fichier ou dossier non trouvé');
    }

    // Si c'est un fichier, l'envoyer avec le bon type MIME
    const stats = fs.lstatSync(filePath);
    if (stats.isFile()) {
        const fileType = mime.lookup(filePath);
        res.type(fileType); // Déterminer et envoyer le type MIME
        return res.sendFile(filePath);
    }

    // Si c'est un dossier, afficher son contenu
    const folderStructure = getFolderStructure(filePath);
    let htmlContent = '<ul>';

    folderStructure.forEach(item => {
        if (item.type === 'dossier') {
            htmlContent += `
                <li><a href="#" onclick="loadPage('/app/${appName}/config2850/${dirName}/${item.name}', 'dossier')">📁${item.name}</a></li>
            `;
        } else {
            htmlContent += `
                <li><a href="#" onclick="loadPage('/app/${appName}/config2850/${dirName}/${item.name}', 'fichier')">📃${item.name}</a></li>
            `;
        }
    });

    htmlContent += '</ul>';

    res.send(`
        <style>
            ul { list-style-type: none; padding: 0; }
            li { margin: 5px 0; font-family: Arial, sans-serif; }
            a { text-decoration: none; color: #007bff; cursor: pointer; }
            a:hover { text-decoration: underline; }
        </style>
        ${htmlContent}
    `);
});




app.listen(port, () => {
    console.log(`Le serveur tourne sur http://localhost:${port}`);
});