document.addEventListener("DOMContentLoaded", () => {
    const topMenu = document.getElementById("top-menu");
   const frame = document.getElementById("content-frame");
    const button = document.getElementById("toggle-frame");

    const fullMenu = document.getElementById('full-menu');
    const foldersOnlyMenu = document.getElementById('folders-only-menu');
    let isFoldersOnly = false;
    const showButton = document.createElement("button");
       let clickCount = 0;

 showButton.textContent = "📂 Afficher";
    showButton.style.position = "absolute";
    showButton.style.width = "60px";
    showButton.style.top = "7px";
    showButton.style.left = "60px";
    showButton.style.display = "none"; 
    showButton.style.zIndex = "9999";
    showButton.style.padding = "5px 10px";
    showButton.style.background = "#007bff";
    showButton.style.color = "#fff";
    showButton.style.border = "none";
    showButton.style.borderRadius = "5px";
    showButton.style.cursor = "pointer";
    document.body.appendChild(showButton);

    

   // Gestion du bouton toggle
button.addEventListener('click', () => {
        if (!isFoldersOnly) {
            fullMenu.style.display = 'none';
            foldersOnlyMenu.style.display = 'block';
            button.textContent = '⇥'; // ou autre icône
        } else {
            foldersOnlyMenu.style.display = 'none';
            fullMenu.style.display = 'block';
            button.textContent = '⇤';
        }
        isFoldersOnly = !isFoldersOnly;
    });

    
    // Réouverture avec "Afficher panneau"
    showButton.addEventListener("click", () => {
        frame.style.display = "block";
        button.style.display = "block";
        showButton.style.display = "none";
        clickCount = 0;
        button.textContent = "⇤";
    });

    // Fonction qui collecte les dossiers/fichiers avec numéro et infos
const collectContent = (container) => {
    const items = [];

    container.querySelectorAll(".tree-item, .tree-item-comment").forEach(item => {
        const toggle = item.querySelector(".toggle");
        let number = toggle?.dataset.number || "";
        const type = item.dataset.type;  // 🔑 récupère vrai type

        if (type === "folder") {
            items.push({
                number,
                name: item.querySelector(".folder").textContent.replace("📁", "").trim(),
                type: "folder"
            });
        } else {
            const fileLink = item.querySelector(".file a");
            const fileName = fileLink.textContent.trim();
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);

            items.push({
                number,
                name: fileName,
                type: isImage ? "image" : "file",
                path: fileLink.getAttribute("onclick")
            });
        }
    });

    return items;
};


    // Mise à jour du menu du haut avec numéro
const updateTopMenu = (treeItem) => {
    const childrenContainer = treeItem.querySelector(".tree-children");

    if (childrenContainer) {
        const content = collectContent(childrenContainer);
        const parentFolder = treeItem.querySelector(".folder")?.textContent.replace("📁", "").trim();
        const parentNumber = treeItem.querySelector(".toggle")?.dataset.number || "";

        if (parentFolder && !content.some(c => c.name === parentFolder)) {
            content.unshift({ number: parentNumber, name: parentFolder, type: "folder" });
        }

        topMenu.innerHTML = "";
        content.forEach(item => {
            const btnContainer = document.createElement("div");
            btnContainer.className = "menu-item-container";

            // Bouton principal (titre)
            const btn = document.createElement("button");
            btn.className = "menu-item";

            let icon = "📄";
            if (item.type === "folder") icon = "📁";
            if (item.type === "image") icon = "🖼️";

            btn.innerHTML = `${item.number ? item.number + " " : ""}${icon} ${item.name}`;

            if (item.type !== "folder" && item.path) {
                btn.addEventListener("click", () => {
                    eval(item.path);
                });
            }

            btnContainer.appendChild(btn);

            // Ajout du bouton commentaire si présent (créé ici)
            // Trouver si le bouton commentaire existe dans l'arborescence
            let commentPath = null;
            if (item.type !== "folder") {
                const treeFiles = treeItem.querySelectorAll(".tree-item-comment");
                treeFiles.forEach(tf => {
                    const fileSpan = tf.querySelector(".file a");
                    if (fileSpan && fileSpan.textContent.trim() === item.name) {
                        const commentBtn = tf.querySelector("button");
                        if (commentBtn) {
                            // Extraire l'url de loadPageViewComment du onclick inline
                            const onclickAttr = commentBtn.getAttribute("onclick");
                            const match = onclickAttr && onclickAttr.match(/loadPageViewComment\('([^']+)'\)/);
                            if (match && match[1]) commentPath = match[1];
                        }
                    }
                });
            }

            if (commentPath) {
                const commentBtn = document.createElement("button");
                commentBtn.textContent = "📌 Com";
                commentBtn.className = "combutton";
                commentBtn.style.marginTop = "3px";
                commentBtn.addEventListener("click", () => {
                    loadPageViewComment(commentPath);
                });
                btnContainer.appendChild(commentBtn);
            }

            topMenu.appendChild(btnContainer);
        });
    }
};



    // Clic sur +
    document.body.addEventListener("click", (e) => {
        if (e.target.closest(".toggle")) {
            const treeItem = e.target.closest(".tree-item");
            updateTopMenu(treeItem);
        }
    });

    // Auto-ouverture 1er dossier
    const firstFolder = document.querySelector(".tree-item");
    if (firstFolder) {
        const toggleIcon = firstFolder.querySelector(".toggle");
        if (toggleIcon) {
            toggleIcon.click();
        }
    }
});
