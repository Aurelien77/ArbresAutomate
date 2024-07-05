// Sélection des éléments de carte
const card1 = document.querySelector('.card');
const card2 = document.querySelector('.card2');
const card3 = document.querySelector('.card3');



// Fonction pour retourner la carte et injecter un nouveau code
function flipCard(event) {
    // Récupère la carte concernée
    const currentCard = event.currentTarget;

    // Retourne la carte
    currentCard.classList.toggle('flipped');
//Crer le lien 
const link = currentCard.querySelector('.addlink');
    // Récupère les éléments enfants de la carte
    const children = currentCard.querySelectorAll('.container > *');

    // Pour chaque élément enfant
    children.forEach(child => {
        // Si la carte est retournée
        if (currentCard.classList.contains('flipped')) {
            //créer link
            link.style.display = 'block';
            // Cache l'élément original
            const originalElement = currentCard.querySelector('.objet');
            originalElement.style.display = 'none';
            // Affiche l'élément alternatif
            const alternativeElement = currentCard.querySelector('.add');
            alternativeElement.style.display = 'block';
            // Applique une rotation inverse au texte alternatif
            alternativeElement.style.transform = 'rotateY(180deg)';
        } else { // Si la carte n'est pas retournée
            //enleve link
            link.style.display = 'none';
            // Affiche l'élément original
            const originalElement = currentCard.querySelector('.objet');
            originalElement.style.display = 'block';
            // Cache l'élément alternatif
            const alternativeElement = currentCard.querySelector('.add');
            alternativeElement.style.display = 'none';
        }
    });
}

// Ajout d'un écouteur d'événement pour détecter quand la souris survole la carte
card1.addEventListener('mouseenter', flipCard);
card2.addEventListener('mouseenter', flipCard);
card3.addEventListener('mouseenter', flipCard);



// Ajout d'un écouteur d'événement pour détecter quand la souris quitte la carte
card1.addEventListener('mouseleave', flipCard);
card2.addEventListener('mouseleave', flipCard);
card3.addEventListener('mouseleave', flipCard);


