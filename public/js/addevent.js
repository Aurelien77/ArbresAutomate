document.addEventListener("DOMContentLoaded", () => {
  const topMenu = document.getElementById("top-menu");
 const frame = document.getElementById("content-frame");
const button = document.getElementById("toggle-frame");   // réduit / développe
const fullMenu = document.getElementById("full-menu");
const foldersOnlyMenu = document.getElementById("folders-only-menu");
const toggleImage = document.getElementById("toggle-image"); // cache / visible

let state = "expanded"; // expanded | reduced | hidden

// --- État initial ---
fullMenu.style.display = 'block';
foldersOnlyMenu.style.display = 'none';
frame.style.display = 'block';
button.style.display = 'inline-block';
button.textContent = '⇤';

// --- Bouton : réduit / développe ---
button.addEventListener('click', () => {
  if (state === "expanded") {
    // Passer en réduit
    fullMenu.style.display = 'none';
    foldersOnlyMenu.style.display = 'block';
    button.textContent = '⇥';
    state = "reduced";
  } else if (state === "reduced") {
    // Repasser en développé
    fullMenu.style.display = 'block';
    foldersOnlyMenu.style.display = 'none';
    button.textContent = '⇤';
    state = "expanded";
  }
});

// --- Image : cache / rend visible ---
toggleImage.addEventListener('click', () => {
  if (state !== "hidden") {
    // Cacher totalement
     frame.style.display ='none';
    fullMenu.style.display = 'none';
    foldersOnlyMenu.style.display = 'none';
    button.style.display = 'none'; // on cache aussi le bouton réduire
    state = "hidden";
  } else {
    // Réafficher → revient en réduit par défaut
    
     frame.style.display ='block';
    foldersOnlyMenu.style.display = 'block';
    fullMenu.style.display = 'none';
    button.style.display = 'inline-block';
    button.textContent = '⇥';
    state = "reduced";
  }
});


function collectContent(container) {
    const items = [];
    const children = container.querySelectorAll(":scope > .tree-item, :scope > .tree-item-comment");

    children.forEach(child => {
        const folderEl = child.querySelector(":scope > .folder");
        const fileEl = child.querySelector(":scope > .file a");

        if (folderEl) {
            const toggle = child.querySelector(":scope > .toggle");
            const number = toggle?.dataset.number || "";
            const folderItem = {
                number,
                name: folderEl.textContent.replace("📁", "").trim(),
                type: "folder",
                path: null,
                children: []
            };

            const subContainer = child.querySelector(":scope > .tree-children");
            if (subContainer) {
                folderItem.children = collectContent(subContainer); // ⬅️ garde la hiérarchie
            }

            items.push(folderItem);
        } else if (fileEl) {
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileEl.textContent.trim());
            const fileNumber = child.querySelector(".file")?.textContent.trim().split(" ")[0] || "";
            items.push({
                number: fileNumber,
                name: fileEl.textContent.trim(),
                type: isImage ? "image" : "file",
                path: fileEl.getAttribute("onclick"),
                children: []
            });
        }
    });

    return items;
}

function renderTopMenuItems(items, parentEl) {
    items.forEach(item => {
        const btnContainer = document.createElement("div");
        btnContainer.className = "menu-item-container";

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

        // 📌 Bouton commentaire
        let commentPath = null;
        if (item.type !== "folder") {
            const treeFiles = document.querySelectorAll(".tree-item-comment");
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

        parentEl.appendChild(btnContainer);

        // 🔁 Si dossier, afficher ses enfants juste après
        if (item.children && item.children.length > 0) {
            renderTopMenuItems(item.children, parentEl);
        }
    });
}

const updateTopMenu = (treeItem) => {
    const childrenContainer = treeItem.querySelector(".tree-children");

    if (childrenContainer) {
        const content = collectContent(childrenContainer);
        const parentFolder = treeItem.querySelector(".folder")?.textContent.replace("📁", "").trim();
        const parentNumber = treeItem.querySelector(".toggle")?.dataset.number || "";

        const rootItem = {
            number: parentNumber,
            name: parentFolder,
            type: "folder",
            path: null,
            children: content
        };

        topMenu.innerHTML = "";
        renderTopMenuItems([rootItem], topMenu);
    }
};


    // Clic sur + (toggle dans l'arborescence)
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


