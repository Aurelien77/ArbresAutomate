
function toggleVisibility(toggleElement) {
    // Récupérer le parent (le div.tree-item) du toggle cliqué
    const currentItem = toggleElement.parentElement;

    // Trouver tous les dossiers au même niveau (frères)
    const siblings = Array.from(currentItem.parentElement.children);

    siblings.forEach(sibling => {
        if (sibling !== currentItem) {
            // Fermer tous les frères : cacher leur .tree-children
            const childrenDiv = sibling.querySelector('.tree-children');
            if (childrenDiv) {
                childrenDiv.classList.add('hidden');
                // Mettre l’icône sur + 
                const toggleIcon = sibling.querySelector('.toggle-icon');
                if (toggleIcon) toggleIcon.textContent = '➕';
            }
        }
    });

    // Toggle de l’élément cliqué : ouvrir ou fermer
    const treeChildren = currentItem.querySelector('.tree-children');
    if (!treeChildren) return;

    const isHidden = treeChildren.classList.contains('hidden');
    if (isHidden) {
        treeChildren.classList.remove('hidden');
        toggleElement.querySelector('.toggle-icon').textContent = '➖';
    } else {
        treeChildren.classList.add('hidden');
        toggleElement.querySelector('.toggle-icon').textContent = '➕';
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

        iframeView.onload = function () {
            const iframeDoc = iframeView.contentDocument || iframeView.contentWindow.document;
            if (iframeDoc) {
                // === 🟢 Bouton fermer ===
                const closeButton = iframeDoc.createElement('button');
                closeButton.textContent = '❌ Fermer';
                closeButton.style.position = 'fixed';
                closeButton.style.top = '21px';
                closeButton.style.right = '21px';
                closeButton.style.padding = '5px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '2%';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';

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
                closeButton.style.top = '20px';
                closeButton.style.right = '10px';
                closeButton.style.padding = '2px';
                closeButton.style.background = 'red';
                closeButton.style.color = 'white';
                closeButton.style.border = 'none';
                closeButton.style.cursor = 'pointer';
                closeButton.style.zIndex = '9999';

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