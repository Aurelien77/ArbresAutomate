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
        .filter(item => item !== 'config2850')// Exclure le dossier "config2850"
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

/* 
-----------------------------------------------------GET---------------------------------------------------------------------------------- */



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
    
    const configPath = path.join(appPath, 'config2850');
    const configDirs = fs.existsSync(configPath) 
        ? fs.readdirSync(configPath)
            .filter(item => fs.lstatSync(path.join(configPath, item)).isDirectory() && item.toLowerCase() !== 'picture2850'  && item !== 'Tech2850')
        : [];

    const menuButtonsHtml = configDirs.map(dir => `
        <button onclick="loadPage('/app/${appName}/config2850/${dir}')">${dir}</button>
    `).join(' ');
    
    res.send(`
    <style>

    
        .categoryMenu {
            position: fixed;
            top: 10px;
            left: -100%;
            width: 90vw;
            height: 50px;
            display: flex;
            flex-direction: row;
            align-items: center;
            background: #f0f0f0;
            transition: left 0.5s ease-in-out;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            opacity: 0;
            border-radius: 0 20px 20px 0;
      
        }
             .categoryMenu button { 
                border-radius: 50%;
             }
        .categoryMenu.active {
            left: 0;
            opacity: 1;
            transition: left 0.5s ease-in-out, opacity 0.3s ease-in-out;
            width : auto;
        }
        .toggleMenuButton {
            position: fixed;
            top: 15px;
            left: 10px;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            background-color: lightblue;
            border-radius: 50%;
            z-index: 1000;
            transition: left 0.5s ease-in-out, transform 0.2s ease-in-out;
          
        }

  
            
            
            }
        .toggleMenuButton:hover {
            transform: scale(1.1);
        }
        .toggleMenuButton.active {
            left: 88vw;
            
            /* Décalage progressif pour suivre le menu */


                 background: linear-gradient(145deg, #e0e0e0, #a0a0a0, #f5f5f5, #777);
                border-radius: 10%;
                   box-shadow:
        inset 1px 1px 3px rgba(255, 255, 255, 0.8),  
        inset -2px -2px 5px rgba(0, 0, 0, 0.2),      
        2px 2px 5px rgba(0, 0, 0, 0.3);              
    color: #333;
    border: 1px solid #999;
    background-size: 200% 200%;
    animation: metalShift 3s ease-in-out infinite;
        }
        .categoryMenu button {
            background: #444;
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            margin: 5px;
            transition: background 0.3s;
        }
        .categoryMenu button:hover {
            background: #575757;
        }
            
        #contentFrame {
        
    
  
    
    }
    </style>

    <button id="toggleMenuButton" class="toggleMenuButton">☰</button>
    <div id="categoryMenu" class="categoryMenu">
        ${menuButtonsHtml}
        <button onclick="loadPage('/app/${appName}/')">-Tree-</button>
        <button onclick="window.location.href='/'">🏠</button>
    </div>


    
    <iframe id="contentFrame" src="/app/${appName}/" style="width:100%; height:100vh; border:none;"></iframe>

    <script>


         function loadPage(url) {
            document.getElementById('contentFrame').src = url;
        }
                    
    
     document.getElementById('toggleMenuButton').addEventListener('click', function () {
    const menu = document.getElementById('categoryMenu');
    const button = document.getElementById('toggleMenuButton');

    menu.classList.toggle('active');
    button.classList.toggle('active');

    if (menu.classList.contains('active')) {
        // Calculer la largeur visible du menu (en px)
        const menuWidth = menu.getBoundingClientRect().width;
        // Décaler le bouton à droite du menu + 10px de marge
        button.style.left = (menuWidth + 10) + 'px';
    } else {
        // Menu caché, bouton à sa position initiale
        button.style.left = '10px';
    }
});
    </script>
    `);
});





// recoit une arborescence de menu créer + envoi fichiers vers ifram view  //

/* Recoit Bouton creer menu  */

app.get('/app/:appName/*', (req, res) => {
    try {
        const { appName } = req.params;
        const relativePath = req.params[0] || '';
        const appPath = path.normalize(path.join(__dirname, '../apifolders', appName, relativePath));

        // 📌 Récupération image (background)
        const imageFolderPath = path.join(__dirname, '../apifolders', appName, 'config2850', 'picture2850');
        const images = getImagesFromFolder(imageFolderPath);
        const imageUrl = images.length > 0
            ? `/app/${appName}/config2850/picture2850/${images[0]}`
            : '/path/to/default-image.jpg';

        // 📌 Vérification du chemin
        if (!fs.existsSync(appPath)) {
            return res.status(404).send('Application ou fichier non trouvé');
        }

        const stats = fs.lstatSync(appPath);

        // === 🟢 Si c'est un fichier ===  --------------------------------------------------------- Style pour l'affichage du code
        if (stats.isFile()) {
            const fileType = mime.lookup(appPath);
            const fileExtension = path.extname(appPath).toLowerCase();

            if (['.js', '.css', '.html', '.txt'].includes(fileExtension)) {
                // Rendu stylisé
                fs.readFile(appPath, 'utf-8', (err, data) => {
                    if (err) return res.status(500).send('Erreur lors de la lecture du fichier');

                    const style = `
                        background-color: black;
                        color: white;
                        padding: 20px;
                        border-radius: 2%;
                        font-family: monospace;
                        font-size: 1rem;
                        overflow-x: auto;
                        white-space: pre-wrap;
                        box-shadow: 3px 3px 2px 1px rgba(237, 237, 241, 0.2);
                        border: 1px solid gold;
                    `;
                    res.send(`<pre style="${style}"><code>${data}</code></pre>`);
                });
            } else {
                res.type(fileType);
                return res.sendFile(appPath);
            }
            return;
        }

        // === 🟢 Si c'est un dossier ===
        const folderStructure = getFolderStructurewithout(appPath);

        // 🔧 Fonction récursive pour générer l'arborescence
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
                <div class="tree-item">
                    <span class="toggle" onclick="toggleVisibility(this)">➕</span>
                    <span class="folder">📁 ${item.name}</span>
                    <div class="hidden tree-children">
                        ${renderFolder(item.contenu, newPath)}
                    </div>
                </div>
            `;
        } else {
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
            const icon = isImage ? '🖼️' : '📃';
            return `
                <div class="tree-item">
                    <span class="file">${icon} <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a></span>
                    ${presetButton}
                </div>
            `;
        }
    }).join('');
};


        // === HTML complet ===
        const htmlContent = `
      
            <style>

.folder, .file {
    flex: 1;
}

.tree-children {

}

.hidden { 
    display: none; 
}
            
#content-frame { 
    position: absolute;
    top: 0;
    left: 10px;
    margin-top: 100px;
    transition: margin-left 0.3s ease;
    z-index: 100;

    display: flex; 
    flex-direction: column;
    padding: 12px;
    color: #222;

    /* 🎨 Intérieur clair avec texture brossée */
    background: repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0.5) 1px,
        rgba(220, 220, 220, 0.6) 2px
    );
    background-color: #e3e3e3;

    /* Bord métallique plus sombre */
    border: 2px solid #2a2a2a;
    border-radius: 0% 5% 5% 0%;

    /* Ombre extérieure */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

    /* Effet relief intérieur */
    box-shadow: 
        inset 0 2px 5px rgba(255, 255, 255, 0.8), /* lumière en haut */
        inset 0 -2px 8px rgba(0, 0, 0, 0.2),      /* ombre en bas */
        0 4px 12px rgba(0, 0, 0, 0.6);            /* extérieur */

    /* Effet de flou léger (style métal brossé) */
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);

    /* Texte */
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

#content-frame ul { 
margin : 0px;
}



  html {

overflow-x: hidden;
  overflow-y: hidden;


}

body {
overflow-x: hidden;
  overflow-y: hidden;

}
     





 

      a { text-decoration: none; }
        
        a:hover { text-decoration: underline; }
       


        .hidden { display: none; padding-left: 20px; }

  


        #container { 
        
    
        display: flex;
  height: 100%;
  width: 100%;

   
        
        }






#split-container {
  flex-grow: 1;
  transition: width 0.6s ease;
margin-top: 55px;

    display: flex;        
      
    height: 100vh;  
   overflow-x: hidden;   
   overflow-y: auto;  
   margin-left: 10px;
}



#split-container iframe {
width: 100%;         
    height: 100%;     
    border: none;     
    gap: none;
    z-index: 10;
    
}



    
    #toggle-frame {
    z-index: 9999;
    position: absolute;

    top:65px;
    left: 10px;
    padding: 5px 10px;

    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    box-shadow: black 1px 1px 1px;
}


    #app-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
   color: black;

    text-align: center;
    line-height: 50px;
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 10000;

}



   

            </style>

            <div id="container">


                <div id="app-header">${appName}</div>

                <img src="${imageUrl}" style="position: absolute; top: 5px; right: 50px; max-width: 50px; border-radius: 10%;"/>


                <button id="toggle-frame">⇤</button>

                <div id="content-frame">
                   ${renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`)}
                </div>

                <div id="split-container">
                    <iframe id="content-frame-view"></iframe>
                    <iframe id="content-frame-view-comment" class="hidden"></iframe>
                </div>
            </div>

            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    const frame = document.getElementById("content-frame");
                    const button = document.getElementById("toggle-frame");
                    let isHidden = false;

                    button.addEventListener("click", () => {
                        frame.style.display = isHidden ? "flex" : "none";
                        document.getElementById("split-container").classList.toggle("expanded", !isHidden);
                        button.textContent = isHidden ? "⇤" : "⇥";
                        isHidden = !isHidden;
                    });
                });

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
            </script>
        `;

        res.send(htmlContent);
    
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).send('Une erreur est survenue lors du traitement de la demande');
    }
});



app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});