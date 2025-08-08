const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const app = express();


app.use('/css', express.static(path.join(__dirname, '../public/css/')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/css_card', express.static(path.join(__dirname, '../public/css/')));


const {
  getImagesFromFolder,
  getFolderStructure,
  getFolderStructurewithout,
    findFirstFile,
  getAllFiles,
  updateProgressBar,  
  getAllFilesWithoutRootFiles

} = require('../public/js/fileUtils');



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

  <link rel="stylesheet" href="/css_card/crea_card.css">

      <title>Arbo|Essences</title>
     
        </head>
        <body>
        <div class="card-container">
            ${cardsHtml}
        </div>
        </body>
    `;
  res.send(htmlContent);
});


// -------------------------------------------------- => § Titres  Menu du Haut
// Générer dynamiquement les boutons de menu basés sur les sous-dossiers dans config2850  +   Génère le chemin pour les cards accueil

//function :  
// handleButtonClick(button)
//loadPage(url)
// Addevent : 
//document.addEventListener("DOMContentLoaded",

app.get('/arborescence/:appName', (req, res) => {
  const appName = req.params.appName;
  const appPath = path.join(__dirname, '../apifolders', appName);

  if (!fs.existsSync(appPath)) {
    return res.status(404).send('Application non trouvée');
  }

  const configPath = path.join(appPath, 'config2850');
  const configDirs = fs.existsSync(configPath)
    ? fs.readdirSync(configPath)
      .filter(item => fs.lstatSync(path.join(configPath, item)).isDirectory() && item.toLowerCase() !== 'picture2850' && item !== 'Tech2850')
    : [];

  // Génère les boutons avec onclick qui cache le bouton ET charge la page
  const menuButtonsHtml = configDirs.map(dir => `
        <button onclick="handleButtonClick(this); loadPage('/app/${appName}/config2850/${dir}')">${dir}</button>
    `).join(' ');

  res.send(`
         <head>
    <link rel="stylesheet" href="/css/style_menu_horizontal.css">
 
    
   <script src="/js/menu.js"></script>
</head>
<body>

    <button id="toggleMenuButton" class="toggleMenuButton">☰</button>
    <div id="categoryMenu" class="categoryMenu">
        ${menuButtonsHtml}

     <button 
    class="buttonload" 
    style="display:none;" 
    onclick="handleButtonClick(this); loadPage('/app/${appName}/')">
    -${appName}-
</button>

        <div onclick="window.location.href='/'" id="accueil">
      
          
   <div class="home">
    <div>⬜️⬜️</div> <div>⬜️⬜️</div>
</div>


</div></div></div>

    <iframe id="contentFrame" src="/app/${appName}/"></iframe>
</body>

 <script src="/js/addevent.js"></script>

    `);
});


// recoit une arborescence de menu créer + envoi fichiers vers ifram view  //

/* Menu Vertical */
// -------------------------------------------------- => § Titres  Menu du Haut
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



    // === 🟢 Si c'est un dossier ===
    const folderStructure = getFolderStructurewithout(appPath);


    const fullMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', false);
    const foldersOnlyMenuHTML = renderFolder(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`, 0, '', true);

    const firstFileUrl = findFirstFile(folderStructure, `${appName}${relativePath ? '/' + relativePath : ''}`);






    const allFiles = getAllFilesWithoutRootFiles(folderStructure, '')


  let activeFileIndex;
const activeIndex = allFiles.findIndex(f => firstFileUrl.endsWith(f));

if (activeIndex >= 0) {
  activeFileIndex = activeIndex;
} else {
  activeFileIndex = -1; // pourcentage 0%
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
    <link rel="stylesheet" href="/css/style_menu_vertical.css">
<script>

 const allFiles = ${JSON.stringify(allFiles.map(f => `/app/${appName}/${f}`))};
  let activeFileIndex = ${activeFileIndex};

  function updateProgressBar(percent) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = percent + '%';
    progressBar.textContent = Math.round(percent) + '%';

    if (percent >= 90) {
      progressBar.style.backgroundColor = 'gold';
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

                <div id="appename">${appName}</div>

          

</div>
        

<div id="progress-bar-container" style="">

     <div id="progress-bar"></div>
</div>
                <div id="split-container">
                 <div id="content-frame">




    
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






app.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});