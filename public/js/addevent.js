document.addEventListener("DOMContentLoaded", () => {
 
    const topMenu = document.getElementById("top-menu");
    const frame = document.getElementById("content-frame");
    const button = document.getElementById("toggle-frame");
    const fullMenu = document.getElementById('full-menu');
    const foldersOnlyMenu = document.getElementById('folders-only-menu');

    // Bouton "Afficher"
    const showButton = document.createElement("button");
    showButton.textContent = "📂 Afficher";
    Object.assign(showButton.style, {
        position: "absolute",
        width: "60px",
        top: "70px",
        right: "94px",
        display: "none",
        zIndex: "9999",
        padding: "5px 10px",
        background: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    });
    document.body.appendChild(showButton);

    let state = "reduced"; 
    // possible values: "reduced", "expanded", "hidden"

    // Gestion du bouton toggle
    button.addEventListener('click', () => {
        if (state === "reduced") {
            // Ouvrir complètement
            fullMenu.style.display = 'block';
            foldersOnlyMenu.style.display = 'none';
            button.textContent = '⇤';
            state = "expanded";
        } 
        else if (state === "expanded") {
            // Masquer complètement
            frame.style.display = "none";
            button.style.display = "none";
            showButton.style.display = "block";
            state = "hidden";
        }
    });

    // Réafficher panneau (menu réduit)
    showButton.addEventListener("click", () => {
        frame.style.display = "block";
        button.style.display = "block";
        showButton.style.display = "none";

        fullMenu.style.display = 'none';
        foldersOnlyMenu.style.display = 'block';
        button.textContent = '⇥';

        state = "reduced";
    });
 fullMenu.style.display = 'none';
    foldersOnlyMenu.style.display = 'block';
    button.textContent = '⇥';



    // Fonction qui collecte les dossiers/fichiers avec numéro et infos
function collectContent(container) {
    const items = [];
    const children = container.querySelectorAll(":scope > .tree-item, :scope > .tree-item-comment");

    children.forEach(child => {
        const folderEl = child.querySelector(":scope > .folder");
        const fileEl = child.querySelector(":scope > .file a");

        if (folderEl) {
            const toggle = child.querySelector(":scope > .toggle");
            const number = toggle?.dataset.number || "";
            items.push({
                number,
                name: folderEl.textContent.replace("📁", "").trim(),
                type: "folder",
                path: null
            });

            // 🔁 Récursif : récupérer les sous-dossiers et fichiers
            const subContainer = child.querySelector(":scope > .tree-children");
            if (subContainer) {
                items.push(...collectContent(subContainer));
            }
        } else if (fileEl) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileEl.textContent.trim());
            items.push({
                number: "",
                name: fileEl.textContent.trim(),
                type: isImage ? "image" : "file",
                path: fileEl.getAttribute("onclick")
            });
        }
    });

    return items;
}



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



  const foldersOnly = content.filter(item => item.type === "folder");
let folderCounter = 0;

content.forEach(item => {
    const btnContainer = document.createElement("div");
    btnContainer.className = "menu-item-container";

    const btn = document.createElement("button");
    btn.className = "menu-item";

    let icon = "📄";
    if (item.type === "folder") icon = "📁";
    if (item.type === "image") icon = "🖼️";

    // ✅ Numéroter uniquement les dossiers
    let number = "";
    if (item.type === "folder") {
        folderCounter++;
        number = folderCounter;
    }

    btn.innerHTML = `${number ? number + " " : ""}${icon} ${item.name}`;

    if (item.type !== "folder" && item.path) {
        btn.addEventListener("click", () => {
            eval(item.path);
        });
    }

    btnContainer.appendChild(btn);

    // 📌 Ajout du bouton commentaire (inchangé)
    let commentPath = null;
    if (item.type !== "folder") {
        const treeFiles = treeItem.querySelectorAll(".tree-item-comment");
        treeFiles.forEach(tf => {
            const fileSpan = tf.querySelector(".file a");
            if (fileSpan && fileSpan.textContent.trim() === item.name) {
                const commentBtn = tf.querySelector("button");
                if (commentBtn) {
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
