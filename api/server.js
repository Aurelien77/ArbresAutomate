const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 3000;

// -------------------------------------------------- => Recupere image background card and dossier map structure

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


// -------------------------------------------------- => creation card + link to Principal page  => /arborescence/${item.name}
app.get('/', (req, res) => {
    const folderStructure = getFolderStructure(path.join(__dirname, '../apifolders'));

    let cardsHtml = '';
    folderStructure.forEach(item => {
        if (item.type === 'dossier') {
            const appUrl = `/arborescence/${item.name}`;
            const imageFolderPath = path.join(__dirname, '../apifolders', item.name, 'config2850', 'pictures2850');

            const images = getImagesFromFolder(imageFolderPath);
            let imageUrl = '';

            if (images.length > 0) {
                // Utiliser la première image trouvée dans le dossier comme image de fond
                imageUrl = `/app/${item.name}/config2850/pictures2850/${images[0]}`;
            } else {
                // Fallback image si aucune image n'est trouvée
                imageUrl = '/path/to/default-image.jpg'; // Remplacez par une image par défaut
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

// -------------------------------------------------- => § Home de l'application

// Générer dynamiquement les boutons de menu basés sur les sous-dossiers dans config2850
app.get('/arborescence/:appName', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);

    if (!fs.existsSync(appPath)) {
        return res.status(404).send('Application non trouvée');
    }


    const configPath = path.join(appPath, 'config2850');
    const configDirs = fs.existsSync(configPath) ? fs.readdirSync(configPath).filter(item => fs.lstatSync(path.join(configPath, item)).isDirectory()) : [];

    const menuButtonsHtml = configDirs.map(dir => {
        return `<button onclick="loadPage('/app/${appName}/config2850/${dir}')" data-url="/app/${appName}/config2850/${dir}">${dir}</button>
`;
    }).join(' ');

    const htmlContent = `
      <style>
      
    h1{
    color:white;
    margin-top:5.7vw;
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
    height: 100%; 
    border: none; 
    overflow: hidden; 
    display: block; 
}
   

#content-frame {

}

ifram img {

 img {
                border: 2px solid red;
                
                }
    
#content-frame-view {
width: 100%;
     
}

          #titre{
         margin-top: 110px;
          }
</style>

       <button id="toggleMenuButton" class="toggleMenuButton">☰</button>

     <div id="categoryMenu" class="categoryMenu">
          
           ${menuButtonsHtml}
    
         <button onclick="window.location.href='${appName}'">Arbre</button>


                    <h1 id="titre" >${appName}</h1>
       </div>
       <div class="iframeview">


       <iframe id="content-frame" src="/${appName}" frameborder="0">
       

       </iframe>

<div>
  <script>
  
  // Définition de la fonction loadPageView
  function loadPageView(url) {
    const iframeView = document.getElementById('content-frame-view');
    if (iframeView) {
        iframeView.src = url; // Charger l'URL dans l'iframe secondaire
    } else {
        console.error("L'iframe 'content-frame-view' n'a pas été trouvé.");
    }
  }

  // Définition de la fonction loadPage
  function loadPage(url) {
    const iframe = document.getElementById('content-frame');
    iframe.src = url; // Charger l'URL dans l'iframe principal
  }

  // Optionnel : Gestion de l'affichage du menu
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

// Ifram Vers Ifram View //

app.get('/app/:appName/*', (req, res) => {
    try {
        const appName = req.params.appName;
        const relativePath = req.params[0];  // Récupère tout ce qui suit "/app/:appName/"
        const appPath = path.join(__dirname, '../apifolders', appName, relativePath); // Construction du chemin complet

        console.log('Je suis dans le composant app/:appName/* => ', appPath); // Log du chemin pour déboguer

        if (!fs.existsSync(appPath)) {
    
            return res.status(404).send('Le dossier spécifié n\'existe pas');
          
        }

        const stats = fs.lstatSync(appPath);

        if (stats.isFile()) {
            // Si c'est un fichier, on vérifie le type MIME ou l'extension du fichier
            const fileType = mime.lookup(appPath);
            const fileExtension = path.extname(appPath).toLowerCase();

            if (['.js', '.css', '.html'].includes(fileExtension)) {
                // Si c'est un fichier de code (par exemple .js, .css, .html), on l'affiche avec <pre> et du CSS
                fs.readFile(appPath, 'utf-8', (err, data) => {
                    if (err) {
                        return res.status(500).send('Erreur lors de la lecture du fichier');
                    }

                    // Injecter le CSS et les balises <pre>
                    const htmlContent = `
                        <style>
                            pre {
                                background-color: black;
                                padding: 20px;
                                border-radius: 5px;
                                font-family: monospace;
                                font-size: 1rem;
                                overflow-x: auto;
                                white-space: pre-wrap;
                                background-color: black;
                                color: white;
                                max-height: none; /* Empêche un scroll vertical dans 'pre' */
                            }
                        </style>
                        <pre>${data}</pre>
                    `;
                    res.send(htmlContent);
                });
            } else {
                // Pour les autres types de fichiers, on les envoie directement
                res.type(fileType); // Déterminer et envoyer le type MIME
                return res.sendFile(appPath);
            }
        } else {
            // Si ce n'est pas un fichier mais un dossier, on continue comme précédemment
            const folderStructure = getFolderStructure(appPath);

            const renderFolder = (structure, currentPath = `/${appName}/${relativePath}`) => {
                const sanitizedPath = currentPath.replace(/\/+/g, '/'); // Supprime les slashes multiples
                return structure.map(item => {
                    const newPath = `${currentPath}/${item.name}`;
                    if (item.type === 'dossier') {
                        return `
                            <li class="folder">
                                <span class="toggle" onclick="toggleVisibility(this)">➕</span>
                                📁 <a href="#" onclick="loadPageView('${newPath}')">${item.name}</a>
                                <ul class="hidden">
                                    ${renderFolder(item.contenu, newPath)}
                                </ul>
                            </li>
                        `;
                    } else {
                        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(item.name);
                        const icon = isImage ? '🖼️' : '📃';
                        return `
                            <li>
                                ${icon} <a href="#" onclick="loadPageView('${newPath}')">${item.name}</a>
                            </li>
                        `;
                    }
                }).join('');
            };


            const htmlContent = `
                <style>
                    ul { list-style-type: none; padding-left: 20px; }
                    li { margin: 5px 0; font-family: Arial, sans-serif; position: relative; }
                    .toggle { cursor: pointer; margin-right: 5px; color: #007bff; }
                    .toggle:hover { text-decoration: underline; }
                    .hidden { display: none; padding-left: 20px; }
                    a { text-decoration: none; color: #007bff; }
                    a:hover { text-decoration: underline; }
    
                    /* Structure en deux colonnes */
                    #container {
                        display: flex;
                      margin-top:1VW;
                    }
    
                    #content-frame {
                        overflow-y: auto;
                        padding: 10px;
                        box-sizing: border-box;
                    }
    
                    #content-frame-view {
                        width: 100%;
                        padding-left: 2VW;
                        padding-top: 2VW;
                    }
                </style>
                <div id="container">
                    <div id="content-frame">
                        <ul>${renderFolder(folderStructure, `/app/${appName}${relativePath ? '/' + relativePath : ''}`)}</ul>
                    </div>
                    <div id="content-frame-view-container">
                        <iframe id="content-frame-view" src="" frameborder="0"></iframe>
                    </div>
                </div>
    
                <script>
                    function loadPageView(url) {
                        const iframeView = document.getElementById('content-frame-view');
                        if (iframeView) {
                            iframeView.src = url; // Load the URL into the iframe
                        } else {
                            console.error("Iframe 'content-frame-view' not found.");
                        }
                    }
    
                    function toggleVisibility(element) {
                        const sublist = element.nextElementSibling.nextElementSibling;
                        if (sublist.classList.contains('hidden')) {
                            sublist.classList.remove('hidden');
                            element.textContent = '➖'; // Icône pour indiquer que la liste est dépliée
                        } else {
                            sublist.classList.add('hidden');
                            element.textContent = '➕'; // Icône pour indiquer que la liste est repliée
                        }
                    }
                </script>
            `;

            res.send(htmlContent);
        }


    } catch (error) {
        console.error("Erreur dans la gestion du chemin de l'application :", error);
        res.status(500).send('Une erreur est survenue lors du traitement de la demande');
    }
});

// FIN Générer dynamiquement les boutons de menu basés sur les sous-dossiers dans config2850  ------------------------------------------------------------------------ 

// ARBRE  // ------------------------------------------------------------------------ 

// Route pour afficher uniquement l'arborescence d'une application
app.get('/:appName', (req, res) => {
    try {
        const appName = req.params.appName;
        const relativePath = req.params[0] || req.params[1] || '';
        const appPath = path.normalize(path.join(__dirname, '../apifolders', appName, relativePath));

        // Vérification si le chemin existe
        if (!fs.existsSync(appPath)) {
            return res.status(404).send('Application ou fichier non trouvé');
        }

        const stats = fs.lstatSync(appPath);

        if (stats.isFile()) {
            // Gestion des fichiers spécifiques
            const fileType = mime.lookup(appPath);
            const fileExtension = path.extname(appPath).toLowerCase();

            if (['.js', '.css', '.html'].includes(fileExtension)) {
                // Rendre les fichiers de code avec un style spécifique
                fs.readFile(appPath, 'utf-8', (err, data) => {
                    if (err) {
                        return res.status(500).send('Erreur lors de la lecture du fichier');
                    }

                    const htmlContent = `
                            <style>
                                pre {
                                    background-color: black;
                                    color: white;
                                    padding: 20px;
                                    border-radius: 5px;
                                    font-family: monospace;
                                    font-size: 1rem;
                                    overflow-x: auto;
                                    white-space: pre-wrap;
                                }
                            </style>
                            <pre>${data}</pre>
                        `;
                    res.send(htmlContent);
                });
            } else {
                // Renvoyer les autres types de fichiers directement
                res.type(fileType);
                return res.sendFile(appPath);
            }
        } else {
            // Si ce n'est pas un fichier mais un dossier, générer l'arborescence
            const folderStructure = getFolderStructure(appPath);

// renderFolder affiche l'arborescence des dossier à gauche ----------------------------------------->


            const renderFolder = (structure, currentPath = `${appName}${relativePath}`) => {
                /*   const sanitizedPath = currentPath.replace(/\/+/g, '/'); */ // Supprime les slashes multiples

                return structure.map(item => {

                    const newPath = `${currentPath}/${item.name}`;
                 
                    if (item.type === 'dossier') {
                        return `
                                <li class="folder">
                                    <span class="toggle" onclick="toggleVisibility(this)">➕</span>


                                    📁 <a href="#" onclick="loadPageView('${newPath}')">${item.name}</a>


                                
                                    <ul class="hidden">
                                        ${renderFolder(item.contenu, newPath)}
                                    </ul>
                                </li>
                            `;
                    } else {
                        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(item.name);
                        const icon = isImage ? '🖼️' : '📃';
                        return `
                                <li>
                                    ${icon} <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a>
                                </li>
                            `;
                    }
                }).join('');
            };















            const htmlContent = `
    <style>
        ul { list-style-type: none; padding-left: 20px; }
        li { margin: 5px 0; font-family: Arial, sans-serif; position: relative; }
        .toggle { cursor: pointer; margin-right: 5px; color: #007bff; }
        .toggle:hover { text-decoration: underline; }
        .hidden { display: none; padding-left: 20px; }
        a { text-decoration: none; color: #007bff; }
        a:hover { text-decoration: underline; }
        #container { display: flex; margin-top: 1VW; }
        #content-frame { overflow-y: auto; padding: 10px; box-sizing: border-box; }
        #content-frame-view { width: 100%; padding-left: 2VW; padding-top: 2VW; }
    </style>
    <div id="container">
        <div id="content-frame">
         <ul> ${renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`)}</ul>
        </div>
        <div id="content-frame-view-container">
            <iframe id="content-frame-view" src="" frameborder="0"></iframe>
        </div>
    </div>

    <script>
        const appName = "${appName}";
        const relativePath = "${relativePath}";
       
        function loadPageView(url) {
            const iframeView = document.getElementById('content-frame-view');
            if (iframeView) {
                iframeView.src = url; // Charge l'URL dans l'iframe
            } else {
                console.error("Iframe 'content-frame-view' non trouvé.");
            }
        }

        function toggleVisibility(element) {
            const sublist = element.nextElementSibling.nextElementSibling;
            if (sublist.classList.contains('hidden')) {
                sublist.classList.remove('hidden');
                element.textContent = '➖'; // Icône pour indiquer que la liste est dépliée
            } else {
                sublist.classList.add('hidden');
                element.textContent = '➕'; // Icône pour indiquer que la liste est repliée
            }
        }

        console.log('App Name:', appName);
        console.log('Relative Path ab :', ${relativePath});
        console.log('Constructed Path:', "${appPath}");
    </script>
`;

            res.send(htmlContent);



        }
    } catch (error) {
        console.error("Erreur dans la gestion du chemin de l'application :", error);
        res.status(500).send('Une erreur est survenue lors du traitement de la demande');
    }
});

app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
