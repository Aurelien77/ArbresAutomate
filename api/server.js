const express = require('express');
const fs = require('fs');
const path = require('path'); 
const mime = require('mime-types');
const app = express();
const port = process.env.PORT || 3000;

app.use('/css', express.static(path.join(__dirname, '../public/css/')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));



const { 
    getImagesFromFolder, 
    getFolderStructure, 
    getFolderStructurewithout,
   
} = require('../public/js/fileUtils');
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

    // Génère les boutons avec onclick qui cache le bouton ET charge la page
    const menuButtonsHtml = configDirs.map(dir => `
        <button onclick="handleButtonClick(this); loadPage('/app/${appName}/config2850/${dir}')">${dir}</button>
    `).join(' ');
    
    res.send(`
         <head>
    <link rel="stylesheet" href="/css/style.css">

     
</head>
<body>

    <button id="toggleMenuButton" class="toggleMenuButton">☰</button>
    <div id="categoryMenu" class="categoryMenu">
        ${menuButtonsHtml}
      <button onclick="handleButtonClick(this); loadPage('/app/${appName}/')" style="display:none;">-${appName}-</button>

        <div onclick="window.location.href='/'" id="accueil">
      
          
   <div>🏠</div>  <div>  Formations    </div>
        </div>
        
        
    </div>

    <iframe id="contentFrame" src="/app/${appName}/"></iframe>
</body>
    <script>
       let hiddenButton = null;
function updateToggleButtonPosition() {
    const menu = document.getElementById('categoryMenu');
    const toggleButton = document.getElementById('toggleMenuButton');
    if (menu.classList.contains('active')) {
        const menuWidth = menu.getBoundingClientRect().width;
        toggleButton.style.left = (menuWidth + 1) + 'px';  // +20 comme tu veux
    } else {
        toggleButton.style.left = '14px';
    }
}
function handleButtonClick(button) {
    // Cacher le bouton cliqué
    button.style.display = 'none';

    // Trouver le bouton -appName- dans le menu
    const categoryMenu = document.getElementById('categoryMenu');
    const buttons = categoryMenu.querySelectorAll('button');

    buttons.forEach(btn => {
        // Si c'est le bouton -appName-
        if (btn.textContent.trim() === '-${appName}-') {
            hiddenButton = btn; // mémoriser ce bouton
        } else if (btn !== button) {
            // Réafficher tous les autres boutons (sauf celui qui vient d'être cliqué)
            btn.style.display = 'inline-block';
        }
    });

    // Réafficher le bouton -appName- quand un autre bouton est cliqué (sauf si c'est lui-même)
    if (hiddenButton && button !== hiddenButton) {
        hiddenButton.style.display = 'inline-block';
    }

       updateToggleButtonPosition();
}


        function loadPage(url) {
            document.getElementById('contentFrame').src = url;
        }

        document.getElementById('toggleMenuButton').addEventListener('click', function () {
            const menu = document.getElementById('categoryMenu');
            const button = document.getElementById('toggleMenuButton');

            menu.classList.toggle('active');
            button.classList.toggle('active');

            if (menu.classList.contains('active')) {
                const menuWidth = menu.getBoundingClientRect().width;
                button.style.left = (menuWidth + 20) + 'px';
            } else {
                button.style.left = '10px';
            }
        });

        
    </script>
    `);
});


// recoit une arborescence de menu créer + envoi fichiers vers ifram view  //

/* Menu Vertical */

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

            if (['.js', '.css', '.html', '.txt', '*',].includes(fileExtension)) {
                // Rendu stylisé
                fs.readFile(appPath, 'utf-8', (err, data) => {
                    if (err) return res.status(500).send('Erreur lors de la lecture du fichier');

                    const style = `
                        background-color: black;
                        color: white;
                        padding: 20px;
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


const renderFolder = (structure, currentPath = `${appName}${relativePath}`, level = 0, parentIndex = '', foldersOnly = false) => {

    return structure.map((item, index) => {
        
        const number = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`;
        const newPath = `${currentPath}/${item.name}`;
        const configFilePath = path.join(__dirname, '../apifolders', appName, 'config2850', 'Tech2850', item.name);

        let presetButton = '';
        if (fs.existsSync(configFilePath)) {
            presetButton = `
                <button class="combutton" onclick="loadPageViewComment('/app/${appName}/config2850/Tech2850/${item.name}')">
                    📌Com
                </button>
            `;
        }

        const levelClass = `level-${level}`;

        if (item.type === 'dossier') {
            const hasChildren = item.contenu && item.contenu.length > 0;
            return `
                <div class="tree-item ${levelClass}">
                    ${hasChildren
                        ? `<span class="toggle" data-number="${number}" onclick="toggleVisibility(this)">
                               ${number} <span class="toggle-icon">➕</span>
                           </span>`
                        : `<span class="toggle-empty"></span>`}
                    <span class="folder folder-icon">📁 ${item.name}</span>
                    ${hasChildren ? `
                        <div class="hidden tree-children">
                            ${renderFolder(item.contenu, newPath, level + 1, number, foldersOnly)}
                        </div>` : ''}
                </div>
            `;
        } else {
           if (foldersOnly) {
             const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
            const icon = isImage ? '🖼️' : '📃';
    return `
        <div class="tree-item-comment ${levelClass}" style="display:none;">
            <span class="file">${icon} <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a></span>
            ${presetButton}
        </div>
    `;
}



            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
            const icon = isImage ? '🖼️' : '📃';
            return `
                <div class="tree-item-comment ${levelClass}">
                    <span class="file">${icon} <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a></span>
                    ${presetButton}
                </div>
            `;
        }
    }).join('');
};


const fullMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', false);
const foldersOnlyMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', true);



        // === HTML complet ===
        const htmlContent = `
      
      <head>
    <link rel="stylesheet" href="/css/style.css">
      <script src="/js/menu.js"></script>
            <script src="/js/addevent.js"></script>
</head>
<body>
<div id="top-menu" class="top-menu"></div>
            <div id="container">

<div class="picturename" >
<img id="toggle-image" src="${imageUrl}" style="cursor:pointer; width: 40px; height: 40px;" />

                <div id="">${appName}</div>

          

</div>
        
 <div id="content-frame">
  <button id="toggle-frame"
   style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; width: 40px; height: 40px; border: none; cursor: pointer;"></button>


    
    <div id="full-menu">
        ${fullMenuHTML}
    </div>
    <div id="folders-only-menu" style="display:none;">
        ${foldersOnlyMenuHTML}
    </div>
</div>

                <div id="split-container">
                    <iframe id="content-frame-view"></iframe>
                    <iframe id="content-frame-view-comment" class="hidden"></iframe>
                </div>
            </div>
</body>

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