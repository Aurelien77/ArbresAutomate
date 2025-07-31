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




// Export des fonctions
module.exports = {
    getImagesFromFolder,
    getFolderStructure,
    getFolderStructurewithout
};

