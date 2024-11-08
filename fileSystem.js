const fs = require('fs');
const path = require('path');

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

function getFileContent(filePath) {
    const absoluteFilePath = path.join(__dirname, '../apifolders/1reve', filePath);
    return fs.createReadStream(absoluteFilePath);
}

module.exports = { getFolderStructure, getFileContent };
