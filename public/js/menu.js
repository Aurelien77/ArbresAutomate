
// Fonction menu haut vertical
function loadPage(url) {
            document.getElementById('contentFrame').src = url;
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



function renderTopMenuItems(items, parentEl, displayedPaths = new Set()) {
    items.forEach(item => {
        // Utiliser path unique pour éviter les doublons, sinon le nom
        const uniqueId = item.path || item.name;

        if (displayedPaths.has(uniqueId)) {
            // Fichier/dossier déjà affiché, on skip
            return;
        }
        displayedPaths.add(uniqueId);

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

        // Bouton commentaire
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

        // Si c’est un dossier, on affiche ses enfants (récursivité)
        if (item.children && item.children.length > 0) {
            renderTopMenuItems(item.children, parentEl, displayedPaths);
        }
    });
}




/* ---------------------------------------------------------------- */





function toggleVisibility(toggleElement) {
    const currentItem = toggleElement.parentElement;
  /*   const siblings = Array.from(currentItem.parentElement.children); */
    const toggleIconElement = toggleElement.querySelector('.toggle-icon');
if (toggleIconElement) {
  toggleIconElement.textContent = isHidden ? '➖' : '➕';
}
 /*    siblings.forEach(sibling => {
        if (sibling !== currentItem) {
            const childrenDiv = sibling.querySelector('.tree-children');
            if (childrenDiv) {
                childrenDiv.classList.add('hidden');
                const toggleIcon = sibling.querySelector('.toggle-icon');
                if (toggleIcon) toggleIcon.textContent = '➕';

                const siblingFolderIcon = sibling.querySelector('.folder-icon');
                if (siblingFolderIcon) siblingFolderIcon.textContent = siblingFolderIcon.textContent.replace('📂', '📁');
            }
        }
    }); */

    const treeChildren = currentItem.querySelector('.tree-children');
    if (!treeChildren) return;

    const isHidden = treeChildren.classList.contains('hidden');
    const folderIcon = currentItem.querySelector('.folder-icon');

    if (isHidden) {
        treeChildren.classList.remove('hidden');
        toggleElement.querySelector('.toggle-icon').textContent = '➖';
        if (folderIcon) folderIcon.textContent = folderIcon.textContent.replace('📁', '📂');
    } else {
        treeChildren.classList.add('hidden');
        toggleElement.querySelector('.toggle-icon').textContent = '➕';
        if (folderIcon) folderIcon.textContent = folderIcon.textContent.replace('📂', '📁');
    }
}




function loadPageView(url) {
    const iframeView = document.getElementById('content-frame-view');

    if (!iframeView) {
        console.error("⚠️ Iframe 'content-frame-view' introuvable !");
        return;
    }

    if (iframeView.src.includes(url) && !iframeView.classList.contains('hidden')) {
        console.log("🔻 Masquage de l'iframe principale");
        iframeView.classList.add('hidden');
        iframeView.src = "about:blank";
    } else {
        console.log("🔺 Affichage de l'iframe principale avec :", url);
        iframeView.src = url;
        iframeView.classList.remove('hidden');

        // Mise à jour de la progress bar
        if (typeof setActiveFileByUrl === 'function') {
            setActiveFileByUrl(url);
        }

        iframeView.onload = function () {
            const iframeDoc = iframeView.contentDocument || iframeView.contentWindow.document;
            if (iframeDoc) {
                // === 🟢 Bouton fermer ===
                const closeButton = iframeDoc.createElement('button');
                closeButton.textContent = '❌ Fermer';
                closeButton.style.position = 'fixed';
                closeButton.style.top = '11px';
                closeButton.style.right = '21px';
                closeButton.style.padding = '5px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '10%';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';
closeButton.onmouseover = () => {
  closeButton.style.boxShadow = '0 0 3px 1px white';
};
closeButton.onmouseout = () => {
  closeButton.style.boxShadow = 'none';
};

closeButton.onclick = () => {
  iframeComment.classList.add('hidden');
  iframeComment.src = "about:blank";
};
                closeButton.onclick = () => {
                    iframeView.classList.add('hidden');
                    iframeView.src = "about:blank";
                };

                iframeDoc.body.insertBefore(closeButton, iframeDoc.body.firstChild);

                // === 🟢 Centrer image si le contenu est une image ===
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
                if (isImage) {
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        body {
                            display: flex;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                        }
                        img {
                            max-width: 90%;
                            max-height: 90%;
                            object-fit: contain;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                }
            }
        };
    }
}


function loadPageViewComment(url) {
    const iframeComment = document.getElementById('content-frame-view-comment');

    if (!iframeComment) {
        console.error("⚠️ Iframe 'content-frame-view-comment' introuvable !");
        return;
    }

    // Vérifier si l'iframe affiche déjà cette URL et est visible
    if (iframeComment.src.includes(url) && !iframeComment.classList.contains('hidden')) {
        console.log("🔻 Masquage de l'iframe");
        iframeComment.classList.add('hidden');  // Cache l'iframe
        iframeComment.src = "about:blank"; // Vide l'iframe pour éviter de recharger inutilement
    } else {
        console.log("🔺 Affichage de l'iframe avec :", url);
        iframeComment.src = url;
        iframeComment.classList.remove('hidden');  // Affiche l'iframe

        // Attendre que l'iframe charge, puis injecter un bouton "Fermer"
        iframeComment.onload = function () {
            const iframeDoc = iframeComment.contentDocument || iframeComment.contentWindow.document;
            if (iframeDoc) {
                const closeButton = iframeDoc.createElement('button');
                   closeButton.textContent = '❌ Fermer';
                closeButton.style.position = 'fixed';
                closeButton.style.top = '11px';
                closeButton.style.right = '21px';
                closeButton.style.padding = '5px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '10%';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';

closeButton.onmouseover = () => {
  closeButton.style.boxShadow = '0 0 3px 1px white';
};
closeButton.onmouseout = () => {
  closeButton.style.boxShadow = 'none';
};

closeButton.onclick = () => {
  iframeComment.classList.add('hidden');
  iframeComment.src = "about:blank";
};
                closeButton.onclick = () => {
                    iframeComment.classList.add('hidden');
                    iframeComment.src = "about:blank";
                };

                // Ajouter le bouton au début du body de l'iframe
                iframeDoc.body.insertBefore(closeButton, iframeDoc.body.firstChild);
            }
        };
    }
}



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


function toggleReducedFolder(el) {
    const parentDiv = el.parentElement;
    const childrenContainer = parentDiv.querySelector('.tree-children');

    if (!childrenContainer) return;

    if (childrenContainer.style.display === 'none' || childrenContainer.style.display === '') {
        childrenContainer.style.display = 'block';
        el.textContent = el.textContent.replace('📁', '📂');
    } else {
        childrenContainer.style.display = 'none';
        el.textContent = el.textContent.replace('📂', '📁');
    }
}





async function openFirstFileInFolder(folderPath) {
  try {
    // Appelle une API dédiée pour récupérer le premier fichier du dossier
    const response = await fetch(`/api/first-file/${encodeURIComponent(folderPath)}`);
    if (!response.ok) throw new Error('Erreur réseau lors de la récupération du fichier');

    const data = await response.json();

    if (data.fileUrl) {
      // Met à jour la source de l'iframe pour afficher ce fichier
      const iframe = document.getElementById('content-frame-view');
      if (iframe) {
        iframe.src = data.fileUrl;
      } else {
        console.warn('Iframe content-frame-view introuvable');
      }

      // Met à jour le menu horizontal avec le chemin du dossier sélectionné (à adapter selon besoin)
      updateTopMenu(folderPath);
    } else {
      alert('Aucun fichier trouvé dans ce dossier');
    }
  } catch (err) {
    console.error('Erreur dans openFirstFileInFolder:', err);
    alert('Erreur lors du chargement du fichier');
  }
}


function loadFirstFileOfFolder(fullPath) {
  // fullPath = "myApp/folder1/subfolder"
  const parts = fullPath.split('/');
  const appName = parts.shift();
  const folder = parts.join('/');

  fetch(`/app/${appName}/first-file/${folder}`)
    .then(response => {
      if (!response.ok) throw new Error('Aucun fichier trouvé');
      return response.json();
    })
    .then(data => {
      if (data.firstFileUrl) {
        document.getElementById('content-frame-view').src = data.firstFileUrl;
      } else {
        alert('Aucun fichier trouvé dans ce dossier.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erreur lors du chargement du fichier.');
    });
}

//--------------------------------------------------

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










