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
            return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
        });
    } catch (err) {
        console.error(`Erreur lors de la lecture du dossier ${folderPath}:`, err);
        return [];  // Retourner un tableau vide en cas d'erreur
    }
}
// Fonction pour récupérer la structure des dossiers mais pas le dossier picture2850
function getFolderStructure(dirPath) {
    const items = fs.readdirSync(dirPath);
    return items
    .filter(item => item !== 'picture2850') 
    .map(item => {
        const itemPath = path.join(dirPath, item);
        const isDirectory = fs.lstatSync(itemPath).isDirectory();
        return {
            type: isDirectory ? 'dossier' : 'fichier',
            name: item,
            contenu: isDirectory ? getFolderStructure(itemPath) : []
        };
    });
}
//Fonction pour récupérer une arborescence de fichier en excluant le dossier config2850
function getFolderStructurewithout(dirPath) {
    const items = fs.readdirSync(dirPath);
    return items
        .filter(item => item !== 'config2850') // Exclure le dossier "config2850"
        .map(item => {
            const itemPath = path.join(dirPath, item);
            const isDirectory = fs.lstatSync(itemPath).isDirectory();
            return {
                type: isDirectory ? 'dossier' : 'fichier',
                name: item,
                contenu: isDirectory ? getFolderStructurewithout(itemPath) : [] // Appel récursif pour les sous-dossiers
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
            const imageFolderPath = path.join(__dirname, '../apifolders', item.name, 'config2850', 'picture2850');
            const images = getImagesFromFolder(imageFolderPath);
            let imageUrl = '';
            if (images.length > 0) {
                // Utiliser la première image trouvée dans le dossier comme image de fond
                imageUrl = `/app/${item.name}/config2850/picture2850/${images[0]}`;
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
    background-color: white;
    border-radius: 20%;
    font-size: 1.5rem;
    color: black;
    text-shadow: 
        1px 1px 0 white,
        -1px 1px 0 white,
        1px -1px 0 white,
        -1px -1px 0 white,
        1px 0 0 white,
        -1px 0 0 white,
        0 1px 0 white,
        0 -1px 0 white;
    text-decoration: none;
    display: inline-block; 
    padding: 0.5rem; 
     border: 0.2px solid black;
}
.card a {
    display: inline-flex; 
    justify-content: center;
    flex-direction: column;
    text-decoration: none;transition: transform 0.3s ease;
height:100%;
  max-width:100%;
}
            .card p {    
              border: 0.2px solid black;
             padding: 0.3em; 
            background-color:white;
          border-radius: 20%;
          width: 100%;
                font-size: 1rem;
                  color: black;
        text-shadow: 
        1px 1px 0 white,
        -1px 1px 0white,
        1px -1px 0 white,
        -1px -1px 0 white,
        1px 0 0 white,
        -1px 0 0 white,
        0 1px 0 white,
        0 -1px 0 white;
     text-decoration: none;
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
// -------------------------------------------------- => § Titres  
// Générer dynamiquement les boutons de menu basés sur les sous-dossiers dans config2850  +   Génère le chemin pour les cards accueil
app.get('/arborescence/:appName', (req, res) => {
    const appName = req.params.appName;
    const appPath = path.join(__dirname, '../apifolders', appName);
    if (!fs.existsSync(appPath)) {
        return res.status(404).send('Application non trouvée');
    }
    // Génère l'arborescnce + filtre le dossier De configuration image
    const configPath = path.join(appPath, 'config2850');
    const configDirs = fs.existsSync(configPath) 
    ? fs.readdirSync(configPath)
        .filter(item => {
            const itemPath = path.join(configPath, item);
            return fs.lstatSync(itemPath).isDirectory() && item.toLowerCase() !== 'picture2850';
        })
    : [];
    const menuButtonsHtml = configDirs.map(dir => {
        return `<button onclick="loadPage('/app/${appName}/config2850/${dir}')" data-url="/app/${appName}/config2850/${dir}">${dir}</button>`;
    }).join(' ');
    const htmlContent = `
      <style>
         /* Style pour le contenu d'arborescence => iframe de gauche */
 iframe {
    width: 100%;
    height: 100%; 
    border: none; 
    overflow: hidden; 
}  
    h1{
margin-left: 200px;
color: red;
margin-top: -5px;
    }
 .categoryMenu {
    position: fixed;
    top: 0;
    left: -100%; /* Caché par défaut */
    border-radius: 0% 0% 10% 10%;
    height: 40px; 
    background-color: #333;
    transition: left 1s ease-in-out;
    z-index: 50;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: row;
    align-items: center;
    
}

/* Quand le menu est actif, il se décale */
.categoryMenu.active {
z-index:20;
    left: 0;
    width:90vw;
    display:flex;
    flex-direction: row;
        border-radius: 10% 0% 30% 0%;
}

/* Bouton pour ouvrir/fermer */
.toggleMenuButton {
    position: fixed;
    top: 5px;
    left: 10px;
    width: 35px;
    height: 35px;
    font-size: 25px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 100;
    transition: transform 0s ease-in-out;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
}

.toggleMenuButton:hover {
    background-color: #45a049;
    box-shadow: 0 0 20px rgba(0, 255, 0, 1);
    transform: scale(1.1);
}

/* Boutons dans le menu */
.categoryMenu button {
    width: 100%;
    margin: 5px 0;
    color: white;
    background: #444;
    border: none;
    cursor: pointer;
    text-align: center;
  
}

.categoryMenu button:hover {
    background: #575757;
}   
body{
width:100%;
height:100%;
}

        #fullscreenbutton{
        position:absolute;
        right:15px;
        top: 5px;
        width: 100px;
        border-radius: 40%;
        }

        .iframeview {
  
margin-top: -33px;
        margin-left:-20px;
        
        }
</style>
       <button id="toggleMenuButton" class="toggleMenuButton">☰</button>
     <div id="categoryMenu" class="categoryMenu">
           ${menuButtonsHtml}
         <button id="arbre" onclick="window.location.href='${appName}'">-Tree-</button>
  <button onclick="window.location.href='/'">🏠</button>
                   

                

       </div>              
        <h1 id="titre" >${appName}</h1>
       <button id="fullscreenbutton">Full ⛶ Screen</button>
       <div class="iframeview">
       <iframe id="content-frame" src="/${appName}" frameborder="0">
       </iframe>
<div>
  <script>
 const fullscreenButton = document.getElementById('fullscreenbutton');
const iframeView = document.getElementById('content-frame'); // L'iframe principale

// Fonction pour mettre à jour le texte du bouton selon l'état du plein écran
function updateFullscreenButtonText() {
  if (document.fullscreenElement) {
    fullscreenButton.innerHTML = "Exit ⛶ Screen";
  } else {
    fullscreenButton.innerHTML = "Full ⛶ Screen";
  }
}

fullscreenButton.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    // Si aucun élément n'est en plein écran, on l'active
    if (iframeView.requestFullscreen) {
      iframeView.requestFullscreen();
    } else if (iframeView.webkitRequestFullscreen) { /* Safari */
      iframeView.webkitRequestFullscreen();
    } else if (iframeView.msRequestFullscreen) { /* IE11 */
      iframeView.msRequestFullscreen();
    }
  } else {
    // Si on est déjà en plein écran, on le quitte
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
});

// Gérer le changement d'état du plein écran pour mettre à jour le texte du bouton
document.addEventListener("fullscreenchange", () => {
  updateFullscreenButtonText();
  console.log("Changement d'état du plein écran");
  if (!document.fullscreenElement) {
    console.log("Sortie du mode plein écran");
  }
});

// Initialiser le texte du bouton au chargement
updateFullscreenButtonText();
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
  // ==================> Optionnel : Gestion de l'affichage du menu
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
// recoit une arborescence + envoi fichiers vers ifram view  //
app.get('/app/:appName/*', (req, res) => {
    try {
        const appName = req.params.appName;
        const relativePath = req.params[0];  
        const appPath = path.join(__dirname, '../apifolders', appName, relativePath); 

        if (!fs.existsSync(appPath)) {
            return res.status(404).send('Le dossier spécifié n\'existe pas');
        }

        const stats = fs.lstatSync(appPath); 

        if (stats.isFile()) {
            const fileType = mime.lookup(appPath);
            const fileExtension = path.extname(appPath).toLowerCase();  

            if (['.js', '.css', '.html', '.url', '.jfif', '.txt'].includes(fileExtension)) {
                fs.readFile(appPath, 'utf-8', (err, data) => {
                    if (err) {
                        return res.status(500).send('Erreur lors de la lecture du fichier');
                    }

                    // Échapper le contenu pour éviter l'exécution du HTML/JS
                    const escapedData = data
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');

                    const htmlContent = `
                        <style>
                            body {
                                margin: 0;
                                background-color: black;
                                color: white;
                                font-family: monospace;
                            }
                            pre {
                                padding: 20px;
                                border-radius: 5px;
                                overflow-x: auto;
                                white-space: pre-wrap;
                            }
                        </style>
                        <pre><code>${escapedData}</code></pre> 
                    `;
                    res.send(htmlContent);
                });
            } else {
                res.type(fileType); 
                return res.sendFile(appPath);
            }
        } else {
            const folderStructure = getFolderStructure(appPath);
            const renderFolder = (structure, currentPath = `/${appName}/${relativePath}`) => {
                const sanitizedPath = currentPath.replace(/\/+/g, '/'); 
                return structure.map(item => {
                    const newPath = `${currentPath}/${item.name}`;
                    if (item.type === 'dossier') {
                        return `
                            <li class="folder">
                                <span class="toggle" onclick="toggleVisibility(this)">➕</span>
                                📁 <a href="#"></a>
                                <ul class="hidden">
                                    ${renderFolder(item.contenu, newPath)}
                                </ul>
                            </li>
                        `;
                    } else {
                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
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
                    .container {
                        display: flex;
                        width: 100%; 
                      
                        box-sizing: border-box;
                        margin: 0;
            
                        overflow: auto;
                    }
                    .container img {
                        max-width: 20vw;
                        max-height: 20vw; 
                        object-fit: contain; 
                        border: 3px solid red;
                    }       
                    #content-frame-view {
                        width: 100%;
                        padding-left: 0VW;
                        padding-top: 2VW;
                        object-fit: contain; 
                        align-items: flex-start;
                        align-content: flex-start;
                        justify-content: center;    
                    }
                    .imageiframe {
                        width: 30vw;
                    }
                 
                </style>
                <div class="container">
                    <div id="content-frame">
                        <ul>${renderFolder(folderStructure, `/app/${appName}${relativePath ? '/' + relativePath : ''}`)}</ul>
                    </div>
                    
                    <iframe id="content-frame-view" src="" frameborder="0"></iframe>
                </div>
                <script>
                    const iframe = document.getElementById('content-frame-view');

                    iframe.onload = function() {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const images = iframeDoc.getElementsByTagName('img');
                        for (let img of images) {
                            img.style.position = 'absolute';
                            img.style.top = '50%';
                            img.style.left = '50%';
                            img.style.transform = 'translate(-50%, -50%)'; 
                            img.style.maxWidth = '75vw';
                            img.style.height = '100%';
                            img.style.borderRadius = '10px'; 
                        }
                    };

                    function loadPageView(url) {
                        const iframeView = document.getElementById('content-frame-view');
                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
                        
                        if (iframeView) {
                            iframeView.src = url;
                            if (isImage) {
                                iframeView.classList.add("imageiframe");
                            }
                        } else {
                            console.error("Iframe 'content-frame-view' not found.");
                        }
                    }

                    function toggleVisibility(element) {
                        const sublist = element.nextElementSibling.nextElementSibling;
                        if (sublist.classList.contains('hidden')) {
                            sublist.classList.remove('hidden');
                            element.textContent = '➖';
                        } else {
                            sublist.classList.add('hidden');
                            element.textContent = '➕';
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

// ARBRE  // ------------------------------------------------------------------------ 

/* Générer une arborescence de l'application avant de générer l'affichage des élément dans la route /app/:appName */

// ---------------------------------------------------------------------------------- 
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
                            <pre><code>${data}</code></pre>
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
            const folderStructure = getFolderStructurewithout(appPath);
// renderFolder affiche l'arborescence des dossier à gauche ----------------------------------------->
const renderFolder = (structure, currentPath = `${appName}${relativePath}`) => {
    return structure.map(item => {
        const newPath = `${currentPath}/${item.name}`;
        const configFilePath = path.join(__dirname, '../apifolders', appName, 'config2850', 'Tech2850', item.name);

        let presetButton = '';
        if (fs.existsSync(configFilePath)) {
            presetButton = `
             <button onclick="loadPageViewComment('/app/${appName}/config2850/Tech2850/${item.name}')">
    📌 Commentaires
</button>
            `;
        }
        if (item.type === 'dossier') {
            return `
                <li class="folder">
                    <span class="toggle" onclick="toggleVisibility(this)">➕</span>
                    📁 <a href="#">${item.name}</a>
                    <ul class="hidden">
                        ${renderFolder(item.contenu, newPath)}
                    </ul>
                </li>
            `;
        } else {
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
            const icon = isImage ? '🖼️' : '📃';
            return `
                <li>
                    ${icon} <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a>
                    ${presetButton}
                </li>
            `;
        }
    }).join('');
};
 const htmlContent = `
    <style>
  #fullscreenbuttoniframe {
  z-index:9999;
    position: absolute;
    top:15px;
    right: 15px;
    transform: translate(-50%, -50%);
    z-index: 51;
  }

  .buttonactivated {

   position: absolute;
      top: 42%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
 
  #content-frame-view {
    width: 100%;
    height: 45vw;
  }
 // Style pour iframe view Arbre ----------------------------------------->
 body {
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
        ul { list-style-type: none; padding-left: 20px; text-decoration: none;}
        li { margin: 5px 0; font-family: Arial, sans-serif; position: relative;list-style-type: none;  }
        .toggle { cursor: pointer; margin-right: 5px; color: #007bff; }
        .toggle:hover { text-decoration: underline; }
        .hidden { display: none; padding-left: 20px; }
        a { text-decoration: none; color: #007bff; }
        a:hover { text-decoration: underline; }
        #container { 
        
    
        display: flex 

        
        
        }


        #content-frame {
z-index: 100;
         overflow-y: auto; 
height : 100%;
           display: flex; 
           flex-direction: row;
            background-color: #cccccc;
             border-radius: 0% 5% 5% 0%;
             box-shadow: 1px 1px 1px #129867;
             text-shadow: 1px 1px 1px #129867;
             padding: 7px;
         margin-top: 5px;
             }
#content-frame a:visited {
    color: black; 
    text-decoration: none; 

}
#split-container {

    display: flex;        
    width: 100vw;        
    height: 100vh;  
   overflow-x: hidden;   
   overflow-y: auto;  
   margin-left: 10px;
}

#split-container iframe {
width: 100vw;         
    height: 100vh     
    border: none;     
    gap: none;
    z-index: 10;
}

#content-frame-view-comment {
    width: 50vw;
    height: 100vh;
    border: none;
    display: block;
}
    #content-frame-view-comment.hidden {
        display: none;
    }

    #toggle-frame {
    position: absolute;
    z-index : 5000;
    top: 15px;
    left: 3px;
    padding: 5px 10px;
    background-color:rgb(30, 255, 0);
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

#toggle-frame:hover {
    background-color:rgb(12, 206, 122);
}
    </style>
    <div id="container">
<button id="toggle-frame">⇤</button>

        <div id="content-frame">
         <ul> ${renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`)}</ul>
        </div>

<button id="fullscreenbuttoniframe">⛶</button>
      <div id="split-container">
    <iframe id="content-frame-view" src="" frameborder="0"> </iframe> 
   <iframe id="content-frame-view-comment" src="" frameborder="0" class="hidden"></iframe>
</div>



    </div>

    <script>
  document.addEventListener("DOMContentLoaded", function () {
    const frame = document.getElementById("content-frame");
    const button = document.getElementById("toggle-frame");
    let isHidden = false;

    button.addEventListener("click", function () {
        if (!isHidden) {
            frame.style.marginLeft = "-100%"; // Déplace la frame à gauche
            button.textContent = "⇥"; // Change le texte du bouton
        } else {
            frame.style.marginLeft = "0vw"; // Remet la frame à sa place
            button.textContent = "⇤";
        }
        isHidden = !isHidden;
    });
});

        const appName = "${appName}";
        const relativePath = "${relativePath}";
       const iframe = document.getElementById('content-frame-view');

  // Une fois que le contenu de l'iframe est chargé
  iframe.onload = function() {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Appliquer un style aux images dans l'iframe
    const images = iframeDoc.getElementsByTagName('img');
    for (let img of images) {
    img.style.position = 'absolute';
       img.style.top = '50%';
      img.style.left = '50%';
      img.style.transform = 'translate(-50%, -50%)'; 
      img.style.maxWidth = '75vw';
      img.style.height = '100%';
      img.style.borderRadius = '10px' 
    }
  };
        function loadPageView(url) {
            const iframeView = document.getElementById('content-frame-view');
            
            if (iframeView) {
                iframeView.src = url; // Charge l'URL dans l'iframe
            } else {
                console.error("Iframe 'content-frame-view' non trouvé.");
            }
        }
function loadPageViewComment(url) {
    const iframeComment = document.getElementById('content-frame-view-comment');

    if (!iframeComment) {
        console.error("⚠️ Iframe 'content-frame-view-comment' introuvable !");
        return;
    }

    // Vérifier si l'iframe affiche déjà cette URL et est visible
    if (iframeComment.src.includes(url) && !iframeComment.classList.contains('hidden')) {
        console.log("🔻 Masquage de l'iframe");
        iframeComment.classList.add('hidden');  // Cache l'iframe
        iframeComment.src = "about:blank"; // Vide l'iframe pour éviter de recharger inutilement
    } else {
        console.log("🔺 Affichage de l'iframe avec :", url);
        iframeComment.src = url;
        iframeComment.classList.remove('hidden');  // Affiche l'iframe

        // Attendre que l'iframe charge, puis injecter un bouton "Fermer"
        iframeComment.onload = function () {
            const iframeDoc = iframeComment.contentDocument || iframeComment.contentWindow.document;
            if (iframeDoc) {
                const closeButton = iframeDoc.createElement('button');
                closeButton.textContent = '❌ Fermer';
                closeButton.style.position = 'fixed';
                closeButton.style.top = '20px';
                closeButton.style.right = '10px';
                closeButton.style.padding = '2px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';

                closeButton.onclick = () => {
                    iframeComment.classList.add('hidden');
                    iframeComment.src = "about:blank";
                };

                // Ajouter le bouton au début du body de l'iframe
                iframeDoc.body.insertBefore(closeButton, iframeDoc.body.firstChild);
            }
        };
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

    const fullscreenButton = document.getElementById('fullscreenbuttoniframe');
  const iframeView = document.getElementById('content-frame-view');

  // Lorsque le bouton est cliqué
  fullscreenButton.addEventListener('click', () => {
    iframeView.classList.toggle('buttonactivated');
  });

 function loadPageView(url) {
    const iframeView = document.getElementById('content-frame-view');

    if (!iframeView) {
        console.error("⚠️ Iframe 'content-frame-view' introuvable !");
        return;
    }

    // Vérifier si l'iframe affiche déjà cette URL et est visible
    if (iframeView.src.includes(url) && !iframeView.classList.contains('hidden')) {
        console.log("🔻 Masquage de l'iframe principale");
        iframeView.classList.add('hidden');  // Cache l'iframe
        iframeView.src = "about:blank"; // Vide l'iframe
    } else {
        console.log("🔺 Affichage de l'iframe principale avec :", url);
        iframeView.src = url;
        iframeView.classList.remove('hidden');  // Affiche l'iframe

        // Attendre que l'iframe charge, puis injecter un bouton "Fermer"
        iframeView.onload = function () {
            const iframeDoc = iframeView.contentDocument || iframeView.contentWindow.document;
            if (iframeDoc) {
                const closeButton = iframeDoc.createElement('button');
                closeButton.textContent = '❌ Fermer';
                closeButton.style.position = 'fixed';
                closeButton.style.top = '20px';
                closeButton.style.right = '10px';
                closeButton.style.padding = '1px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';

                closeButton.onclick = () => {
                    iframeView.classList.add('hidden');
                    iframeView.src = "about:blank";
                };

                // Ajouter le bouton au début du body de l'iframe
                iframeDoc.body.insertBefore(closeButton, iframeDoc.body.firstChild);
            }
        };
    }
}


  function toggleVisibility(element) {
    const sublist = element.nextElementSibling.nextElementSibling;
    if (sublist.classList.contains('hidden')) {
      sublist.classList.remove('hidden');
      element.textContent = '➖';
    } else {
      sublist.classList.add('hidden');
      element.textContent = '➕';
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

app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});
