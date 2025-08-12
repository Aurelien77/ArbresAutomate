document.addEventListener("DOMContentLoaded", () => {

  //Addevent qui attendent la création du Dom

  const topMenu = document.getElementById("top-menu");
  const frame = document.getElementById("content-frame");
  const fullMenu = document.getElementById("full-menu");
  const foldersOnlyMenu = document.getElementById("folders-only-menu");
  const toggleImage = document.getElementById("toggle-image"); // cache / visible

  let state = "hidden"; // expanded | reduced | hidden

  // --- État initial ---
  fullMenu.style.display = 'none';
  foldersOnlyMenu.style.display = 'none';
  frame.style.display = 'none';





  // --- Image : cache / rend visible menu gauche---

  toggleImage.addEventListener('click', () => {
    switch (state) {
      case "expanded":
        // ↘ Passer à l'état caché
        frame.style.display = 'none';
        fullMenu.style.display = 'none';
        foldersOnlyMenu.style.display = 'none';

        state = "hidden";
        break;

      case "hidden":
        // ↘ Réafficher en mode réduit
        frame.style.display = 'block';
        foldersOnlyMenu.style.display = 'none';
        fullMenu.style.display = 'block';

        state = "expanded";
        break;

     /*  case "reduced":
        // ↘ Étendre le menu
        frame.style.display = 'block';
        foldersOnlyMenu.style.display = 'none';
        fullMenu.style.display = 'block';

        state = "expanded";
        break; */
    }
  });







 const updateTopMenu = (treeItem) => {
  const childrenContainer = treeItem.querySelector(".tree-children");

  if (childrenContainer) {
    let content = collectContent(childrenContainer);

    // Tri par numéro (si les numéros sont numériques)
    content.sort((a, b) => {
      const numA = parseFloat(a.number) || 0;
      const numB = parseFloat(b.number) || 0;
      return numA - numB;
    });

    const parentFolder = treeItem
      .querySelector(".folder")
      ?.textContent.replace("📁", "")
      .trim();
    const parentNumber =
      treeItem.querySelector(".toggle")?.dataset.number || "";

    const rootItem = {
      number: parentNumber,
      name: parentFolder,
      type: "folder",
      path: null,
      children: content
    };

    // Vider le menu avant rendu
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










  document.getElementById('toggleMenuButton').addEventListener('click', function () {
    const menu = document.getElementById('categoryMenu');
    const button = document.getElementById('toggleMenuButton');

    menu.classList.toggle('active');
    button.classList.toggle('active');

    if (menu.classList.contains('active')) {
      const menuWidth = menu.getBoundingClientRect().width;
      button.style.left = (menuWidth + 20) + 'px';
    } else {
      button.style.left = '10px';
    }
  });

