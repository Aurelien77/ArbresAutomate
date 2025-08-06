document.addEventListener("DOMContentLoaded", () => {
  const topMenu = document.getElementById("top-menu");
  const frame = document.getElementById("content-frame");
  const button = document.getElementById("toggle-frame");
  const fullMenu = document.getElementById("full-menu");
  const foldersOnlyMenu = document.getElementById("folders-only-menu");
  const toggleImage = document.getElementById("toggle-image");


  toggleImage.addEventListener("click", () => {
    if (menu.style.display === "none" || menu.style.display === "") {
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  });
  let state = "reduced"; // "reduced" | "expanded" | "hidden"

  // Setup initial state
  fullMenu.style.display = 'none';
  foldersOnlyMenu.style.display = 'block';
  frame.style.display = 'block';
  button.style.display = 'inline-block'; 
  button.textContent = '⇥';

  // Si tu veux garder le bouton toggle-frame opérationnel
  button.addEventListener('click', () => {
    if(state === "reduced") {
      // Passage à expanded
      fullMenu.style.display = 'block';
      foldersOnlyMenu.style.display = 'none';
      frame.style.display = 'block';
      button.textContent = '⇤';
      state = "expanded";
    } else if(state === "expanded") {
      // Passage à hidden
      fullMenu.style.display = 'none';
      foldersOnlyMenu.style.display = 'none';
      frame.style.display = 'none';
      button.style.display = 'none'; // cache le bouton
      // toggleImage reste visible pour revenir
      state = "hidden";
    }
  });

  // Gestion du toggle via l'image
  toggleImage.style.cursor = 'pointer';
  toggleImage.addEventListener('click', () => {
    if(state === "reduced") {
      // Passer à expanded
      fullMenu.style.display = 'block';
      foldersOnlyMenu.style.display = 'none';
      frame.style.display = 'block';
      button.style.display = 'inline-block';
      button.textContent = '⇤';
      state = "expanded";
    } else if(state === "expanded") {
      // Passer à hidden
      fullMenu.style.display = 'none';
      foldersOnlyMenu.style.display = 'none';
      frame.style.display = 'none';
      button.style.display = 'none';
      state = "hidden";
    } else if(state === "hidden") {
      // Revenir à reduced
      fullMenu.style.display = 'none';
      foldersOnlyMenu.style.display = 'block';
      frame.style.display = 'block';
      button.style.display = 'inline-block';
      button.textContent = '⇥';
      state = "reduced";
    }
  });

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


