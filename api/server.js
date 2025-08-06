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
    <head>
      <title>Arbo|Essences</title>
        <style>
  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5vw;
    padding: 2vw;
    border-radius: 1vw;
 
    position: relative;
  }

  /* On crée un fond overlay SVG en absolute, derrière les cartes */
  .background-pattern {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none; /* clics passent au-dessus */
    z-index: 0;
  }

  .card {
    width: 20vw;
    height: 20vw;
    margin: 1vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  
    border-radius: 1vw;
    box-shadow:
      inset 1px 1px 10px #ccd4d0ff,
      inset -1px -1px 10px #ffffff,
      3px 3px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease-in-out;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    position: relative;
    z-index: 1; /* au-dessus du pattern */
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow:
      inset 1px 1px 5px #d9eee3ff,
      inset -1px -1px 7.5px #ffffff,
      6px 6px 15px rgba(0, 0, 0, 0.3);
  }

  .card h2 {
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-word;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 20%;
    font-size: 1.5rem;
    color: #333;
    padding: 0.5rem;
    border: 0.2px solid #888;
    text-shadow:
      1px 1px 0 #f0f0f0,
      -1px 1px 0 #f0f0f0,
      1px -1px 0 #f0f0f0,
      -1px -1px 0 #f0f0f0;
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
        </head>
        <body>
        <div class="card-container">
            ${cardsHtml}
        </div>
        </body>
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
      
          
   <div>   
⬜️⬜️
</div>Apps</div>
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
                          animation: blink 0.7s infinite;
                    `;
                    res.send(`<pre style="${style}"><code>${data}</code></pre>`);
                });
            } else {
                res.type(fileType);
                return res.sendFile(appPath);
            }
            return;
        }

function getAllFiles(structure, currentPath = '') {
  let files = [];
  for (const item of structure) {
    if (item.type === 'fichier') {
      // Ajoute le chemin complet relatif
      files.push(currentPath ? `${currentPath}/${item.name}` : item.name);
    } else if (item.type === 'dossier' && item.contenu) {
      // Appel récursif avec chemin mis à jour
      files = files.concat(getAllFiles(item.contenu, currentPath ? `${currentPath}/${item.name}` : item.name));
    }
  }
  return files;
}


        // === 🟢 Si c'est un dossier ===
        const folderStructure = getFolderStructurewithout(appPath);

        // 🔧 Fonction récursive pour générer l'arborescence
const renderFolder = (
    structure,
    currentPath = `${appName}${relativePath}`,
    level = 0,
    parentIndex = '',
    foldersOnly = false
) => {
    let folderCounter = 0;
    let fileCounter = 0;

    // Trie dossiers avant fichiers
    const sortedStructure = [...structure].sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === 'dossier' ? -1 : 1;
    });

    return sortedStructure.map((item) => {
        const newPath = `${currentPath}/${item.name}`;
        const configFilePath = path.join(
            __dirname,
            '../apifolders',
            appName,
            'config2850',
            'Tech2850',
            item.name
        );

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
            folderCounter++;
            const number = parentIndex ? `${parentIndex}.${folderCounter}` : `${folderCounter}`;
            const hasChildren = item.contenu && item.contenu.length > 0;

            // Ici : récupère le premier fichier dans ce dossier pour charger uniquement ce fichier
            const firstFileInFolder = hasChildren ? findFirstFile(item.contenu, newPath) : null;
            const loadUrl = firstFileInFolder || `/app/${newPath}`; // fallback au dossier si aucun fichier

            return `
              <div class="tree-item ${levelClass}">
                ${hasChildren
                  ? `<span class="toggle" data-number="${number}" onclick="toggleVisibility(this)">
                       ${number} 
                     </span>`
                  : `<span class="toggle-empty"></span>`}
                <span class="folder folder-icon" style="cursor:pointer;" onclick="loadPageView('${loadUrl}')">
                  🎓${item.name}
                </span>

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
                        <span class="file"> <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a></span>
                        ${presetButton}
                    </div>
                `;
            }

            fileCounter++;
            let number = '';
            if (parentIndex) {
                // numéro fichier après dossiers
                const offsetNumber = folderCounter + fileCounter;
                number = `${parentIndex}.${offsetNumber}`;
            }

            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
            const icon = isImage ? '🖼️' : '📃';

            return `
                <div class="tree-item-comment ${levelClass}">
                    <span class="file">${number ? number + " " : ""}${icon} 
                        <a href="#" onclick="loadPageView('/app/${newPath}')">${item.name}</a>
                    </span>
                    ${presetButton}
                </div>
            `;
        }
    }).join('');
};



function findFirstFile(structure, currentPath = '') {
    // 1️⃣ Chercher d'abord un fichier directement dans le dossier courant
    const file = structure.find(item => item.type === 'fichier');
    if (file) {
        return `/app/${currentPath}/${file.name}`;
    }

    // 2️⃣ Sinon, explorer récursivement les dossiers
    for (const item of structure) {
        if (item.type === 'dossier' && item.contenu && item.contenu.length > 0) {
            const nestedFile = findFirstFile(item.contenu, `${currentPath}/${item.name}`);
            if (nestedFile) return nestedFile;
        }
    }

    return null;
}



const fullMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', false);
const foldersOnlyMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', true);

const firstFileUrl = findFirstFile(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`);


function getAllFiles(structure, currentPath = '') {
  let files = [];
  for (const item of structure) {
    if (item.type === 'fichier') {
      files.push(currentPath ? `${currentPath}/${item.name}` : item.name);
    } else if (item.type === 'dossier' && item.contenu) {
      files = files.concat(getAllFiles(item.contenu, currentPath ? `${currentPath}/${item.name}` : item.name));
    }
  }
  return files;
}




const allFiles = getAllFiles(folderStructure, '');


const activeFilePath = relativePath || '';



const activeIndex = allFiles.findIndex(f => activeFilePath.endsWith(f));
const activeFileIndex = activeIndex >= 0 ? activeIndex : 0;
  const totalFiles = allFiles.length;


function updateProgressBar() {
  const percent = ((activeFileIndex + 1) / allFiles.length) * 100;
  console.log('Progress percent:', percent);
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) {
    console.error('Progress bar element introuvable');
    return;
  }
  progressBar.style.width = percent + '%';

  if (percent >= 90) {
    console.log('Rouge');
    progressBar.style.backgroundColor = 'red';
  } else if (percent >= 75) {
    console.log('Orange');
    progressBar.style.backgroundColor = 'orange';
  } else {
    console.log('Vert');
    progressBar.style.backgroundColor = '#4caf50';
  }
}


// Appelle cette fonction quand l’utilisateur clique sur un fichier ou dossier
function setActiveFileByUrl(url) {
  const index = allFiles.indexOf(url);
  if (index >= 0) {
    activeFileIndex = index;
    updateProgressBar();
  }
}

        // === HTML complet ===
        const htmlContent = `
      
      <head>
    <link rel="stylesheet" href="/css/style.css">
<script>
 const allFiles = ${JSON.stringify(allFiles.map(f => `/app/${appName}/${f}`))};
  let activeFileIndex = ${activeFileIndex};

  function updateProgressBar(percent) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = percent + '%';
    progressBar.textContent = Math.round(percent) + '%';

    if (percent >= 90) {
      progressBar.style.backgroundColor = 'red';
    } else if (percent >= 75) {
      progressBar.style.backgroundColor = 'orange';
    } else {
      progressBar.style.backgroundColor = '#4caf50';
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    const percent = ((activeFileIndex + 1) / allFiles.length) * 100;
    updateProgressBar(percent);
  });

  function setActiveFileByUrl(url) {
    const index = allFiles.indexOf(url);
    if (index >= 0) {
      activeFileIndex = index;
      const percent = ((activeFileIndex + 1) / allFiles.length) * 100;
      updateProgressBar(percent);
    }
  }
  </script>
  <script src="/js/menu.js"></script>
  <script src="/js/addevent.js"></script>




</head>
<body>
<div id="top-menu" class="top-menu"></div>
            <div id="container">

<div class="picturename">
<img id="toggle-image" src="${imageUrl}" style="cursor:pointer; width: 40px; height: 40px;" />

                <div id="">${appName}</div>

          

</div>
        

<div id="progress-bar-container" style="">

     <div id="progress-bar"></div>
</div>
                <div id="split-container">
                 <div id="content-frame">
  <button id="toggle-frame"
   style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; width: 40px; height: 40px; border: none; cursor: pointer;"></button>


    
    <div id="full-menu">
        ${fullMenuHTML}
    </div>   <div id="folders-only-menu" style="display:none;">
        ${foldersOnlyMenuHTML}
    </div>
</div>
                  <iframe id="content-frame-view" src="${firstFileUrl || ''}"></iframe>
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

// Route pour récupérer le premier fichier d'un dossier donné
app.get('/app/:appName/first-file/*', (req, res) => {
  try {
    const { appName } = req.params;
    const relativeFolderPath = req.params[0] || '';
    const folderPath = path.normalize(path.join(__dirname, '../apifolders', appName, relativeFolderPath));

    if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    // Récupération de la structure pour ce dossier
    const folderStructure = getFolderStructurewithout(folderPath);

    const firstFile = findFirstFile(folderStructure, `${appName}/${relativeFolderPath}`);

    if (!firstFile) {
      return res.status(404).json({ error: 'Aucun fichier trouvé dans ce dossier' });
    }

    res.json({ firstFileUrl: firstFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.listen(3000, () => {
    console.log('Serveur en écoute sur le port 3000');
});