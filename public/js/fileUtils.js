const fs = require('fs');
const path = require('path');


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


function getFolderStructurewithoutfirstfile(dirPath, level = 0) {
  const items = fs.readdirSync(dirPath);

  return items
    .filter(item => item !== 'config2850') // Exclure "config2850"
    .map(item => {
      const itemPath = path.join(dirPath, item);
      const isDirectory = fs.lstatSync(itemPath).isDirectory();

      if (level === 0 && !isDirectory) {
        // ❌ Exclure les fichiers de la racine
        return null;
      }

      return {
        type: isDirectory ? 'dossier' : 'fichier',
        name: item,
        contenu: isDirectory ? getFolderStructurewithout(itemPath, level + 1) : []
      };
    })
    .filter(Boolean); // ❗ Supprimer les "null" éventuels
}


//---------------------Menu de gauche function----------------------------------------------
  // 🔧 Fonction récursive pour générer l'arborescence
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

    function renderFolder (
appName, structure, currentPath, level = 0, parentIndex = '', foldersOnly = false
    )  {
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
//------------------------------------------------------------------

function getAllFilesWithoutRootFiles(structure, pathPrefix = '', level = 0) {
  let files = [];

  for (const item of structure) {
    const fullPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;

    if (item.type === 'fichier') {
      if (level > 0) {
        files.push(fullPath); // inclure fichier uniquement s'il est dans un sous-dossier
      }
    } else if (item.type === 'dossier') {
      files = files.concat(getAllFilesWithoutRootFiles(item.contenu, fullPath, level + 1));
    }
  }

  return files;
}
// Export des fonctions
module.exports = {
    getImagesFromFolder,
    getFolderStructure,
    getFolderStructurewithout,
  renderFolder,
  findFirstFile,
  getAllFiles,
  updateProgressBar,
  getFolderStructurewithoutfirstfile,
  getAllFilesWithoutRootFiles
};

