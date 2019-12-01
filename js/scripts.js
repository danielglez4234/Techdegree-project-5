const $gallery = $('#gallery');
const $header = $('header');
const url = 'https://randomuser.me/api/?results=12&nat=US';
$gallery.text('Loading...'); // it will be displayed at the beginning of the upload, and will change when updating "gallery"


 fetch(url)
		.then(checkStatus)
		.then(response => response.json())
    .then(data => {
      generateGalleryMarkup(data.results); // the card is generated first
      modalEventHandler(data.results);// then it is collected to generate the modal
    })
    .then(search) // We call the function search after having created the employees
		.catch(error => {
      console.log('looks like there was a problem ',error);
      $gallery.text('Something went wrong...');
    });
    //  checkStatus FUNCTION; checking if there were no problems in the response
  function checkStatus(response){
  	if(response.ok){
  		return Promise.resolve(response);
  	}else{
  		return Promise.reject(new Error(reponse.statusText));
  	}
  }

// ----------------Create Employee "Card" Function ------------------------------------------------
function generateGalleryMarkup(data){
$gallery.text(''); // updates the gallery 'loading...' text
let markup;
// print the information of each of the employees
data.forEach(person => {
    markup =`
    <div class="card">
        <div class="card-img-container">
            <img class="card-img" src="${person.picture.large}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${person.name.first} ${person.name.last}</h3>
            <p class="card-text">${person.email}</p>
            <p class="card-text cap">${person.location.city}, ${person.location.state}</p>
        </div>
    </div>
    `;
    $gallery.append(markup);
  });
}

// ---------------- Create Modal Function -----------------------------------------------------
function generateGalleryModal(data, i){
  // only return the HTML of the modal with the information received
  let modal;
  modal = `
  <div class="modal-container">
      <div class="modal">
          <button type="button" id="modal-close-btn" class="modal-close-btn" ><strong>X</strong></button>
          <div class="modal-info-container">
              <img class="modal-img" src="${data[i].picture.large}" alt="profile picture">
              <h3 id="name" class="modal-name cap">${data[i].name.first} ${data[i].name.last}</h3>
              <p class="modal-text">${data[i].email}</p>
              <p class="modal-text cap">${data[i].location.city}</p>
              <hr>
              <p class="modal-text">${data[i].cell}</p>
              <p class="modal-text">${data[i].location.street.number} ${data[i].location.street.name},
                                    ${data[i].location.state},
                                    ${data[i].location.postcode}</p>
              <p class="modal-text">Birthday: ${data[i].dob.date.substr(8, 2)}
                                              /${data[i].dob.date.substr(5, 2)}
                                              /${data[i].dob.date.substr(2, 2)}</p>
          </div>
      </div>

      <!-- IMPORTANT: Below is only for exceeds tasks -->
      <div class="modal-btn-container">
          <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
          <button type="button" id="modal-next" class="modal-next btn">Next</button>
      </div>
  </div>
  `;
  return modal;
}

// ---------------- Card Event Handler Function -----------------------------------------------------

function modalEventHandler(data){
  const $cards = $('.card');

    for (let i = 0; i < $cards.length; i++) { // loop over every "card" element
      // here I avoid using jquery to add the event to be able to place it in the array
      $cards[i].addEventListener('click', () => {

      $gallery.append(generateGalleryModal(data, i)); //the "i" indicates the employee that was selected and must be printed to the function
      closeButton(); // call the function to generate the click event in the "X"
      showNextPrevEmployee(data, i); // call the function and send who the current user is
      });
    }
}

// ---------------- Close Button Function -----------------------------------------------------

function closeButton(){
  const $closeButton = $('#modal-close-btn');
  const $modal = $('.modal');
  $closeButton.on('click', () => { // when the "X" is clicked then the modal close
    const $modalContainer = $('.modal-container');
    $modalContainer.remove(); // remove the modal
  });
}

// ---------------- Show PREV and show NEXT Function ------------------------------------------

function showNextPrevEmployee(data, i){

  const $nextPrevEmployee = $('.btn');
  const $displayNext = $('.modal-next');
  const $displayPrev = $('.modal-prev');

// ------- function that shows the next or previous employee -------
  function selectNextOrPrev($nextOrPrevDisplay, dataR, nextOrPrevValue){
    const $modalContainer = $('.modal-container');
    $nextOrPrevDisplay.css("display", ""); // if it is not at the end or at the top of the list, the button is displayed

    // the current user is removed and the next one is shown
    $modalContainer.remove();
    $gallery.append(generateGalleryModal(dataR, nextOrPrevValue));
    // functions are called again to reactivate the click events
    closeButton();
    showNextPrevEmployee(dataR, nextOrPrevValue);
  }

    $nextPrevEmployee.on('click', (event) =>{
      const nextOrPrev = event.target;
        if (nextOrPrev.textContent === 'Next') { // if the button pressed is "Next"
          const next = i + 1; // "i" represents the index
          if (next != 12) { // if "next" is different 12 the next employee is shown
            selectNextOrPrev($displayNext, data, next); // call the function with the value of the next employee
          }else { // if it is equal to 12 it means that the end of the list was reached
            $displayNext.css("display", "none"); // the "next" button is remove
          }
        }else {
          const prev = i - 1;
          if (prev != -1) { // if "next" is different -1 the prev employee is shown
            selectNextOrPrev($displayPrev, data, prev); // call the function with the value of the previous employee
          }else { // if it is equal to -1 it means that we are at the top of the list
            $displayPrev.css("display", "none"); // the "prev" button is remove
          }
        }
    });

}

// ---------------- SEARCH Function -----------------------------------------------------------

function search(){

  const $searchContainer = $('.search-container');
  const $cardName = $('.card .card-info-container h3');
  const $card = $('.card');
  const $alertOfResultsFound = $('<h2></h2>');// here the text "total Results Found For: " will be display
  $header.append($alertOfResultsFound);

  const searchInputHTML = `
  <form action="#" method="get">
      <input type="search" id="search-input" class="search-input" placeholder="Search..." value="">
      <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
  </form>
  `;
  $searchContainer.append(searchInputHTML); // generate the search input


  const $searchInput = $('form .search-input');
  $searchInput.on('keyup', (event) =>{ // when a key is pressed the search is executed

    const searchContent = $searchInput[0].value.toLowerCase(); // save what is being written
    const resultsFound = [];
    let total = 0;

    for (let i = 0; i < $cardName.length; i++) { // loop over the employees names
      const cardMatch = $cardName[i].textContent.toLowerCase();
      if (cardMatch.indexOf(searchContent) !== -1) { // when a result matches it's shown and those that do not, are hide
        resultsFound.push($card[i]); // push the cards found in the new array
        $card[i].style.display = '';
        total = resultsFound.length;

        $alertOfResultsFound.text(total + ' Results Found For: ' + searchContent);
      }else {
        $card[i].style.display = 'none';
      }
    }

   if (resultsFound.indexOf(searchContent) === -1 && total < 1) { // when none of the results match
     $alertOfResultsFound.text('NO Results Found For: ' + searchContent);
   }else if (searchContent == '') { // delete the result alert text when nothing is written
     $alertOfResultsFound.text('');
   }
  });


}
