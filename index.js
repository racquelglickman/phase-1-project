let baseURL = 'http://localhost:3000';
let singlesearchURL = 'https://api.tvmaze.com/singlesearch/shows?q='
let searchURL = 'https://api.tvmaze.com/search/shows?q='

let showTitle = '';

let navOptions = document.querySelectorAll('nav h3');

let showSearch = document.querySelector('#show-search');
let inputShowSearch = document.querySelector('input-show-search');

let displayedShows = document.querySelector('#displayed-shows');

let categories = [
    {
        option: 'currently',
        displayName: 'Currently Watching',
        element: navOptions[0],
    },
    {
        option: 'future',
        displayName: 'Future Watching',
        element: navOptions[1],
    },
    {
        option: 'finished',
        displayName: 'Finished Watching',
        element: navOptions[2],
    },
    {
        option: '',
        displayName: 'All Shows',
        element: navOptions[3],
    },
];

// when the page loads, default load the shows from currently into displayed-shows
let clickedCategory = categories[0].option;
categories[0].element.style.textShadow = '1px 1px 2px';
fetchData(clickedCategory);

// add 'click' and 'mouseover' event listeners to each nav bar choice
navOptions.forEach((navChoice, index) => {
    
    // selected nav category (full name) -> name of correct category in db.json (one word)
    let navCategory = categories[index].option;

    // when you click an h3, add shadow and fetch data
    navChoice.addEventListener('click', () => {
        console.log(`${navChoice.textContent} was clicked`);
        clickedCategory = navCategory;

        // reset textShadows for all h3 elements and adds textShadow to clicked
        navOptions.forEach((nav) => {
            nav.style.textShadow = '';
        });

        navChoice.style.textShadow = '1px 1px 2px';

        fetchData(clickedCategory);
    });

    // when you mouseover any h3, text becomes shadowed
    // when you mouseout, text changes back unless it's the clicked category
    navChoice.addEventListener('mouseover', () => {
        navChoice.style.textShadow = '1px 1px 2px';

        navChoice.addEventListener('mouseout', () => {
            if (clickedCategory !== navCategory) {
                navChoice.style.textShadow = '';
            };

        });
    });
});

// fetch data for specific category before rendering
function fetchData(category){

    fetch(`${baseURL}/shows/${category}`)
        .then((response) => response.json())
        .then((data) => {
            displayedShows.innerHTML ='';

            // sort shows alphabetically before rendering
            data.sort((a, b) => (a.name > b.name) ? 1 : -1)

            renderShows(data);
        });
};

// renders shows and puts them in displayedShows div
function renderShows(shows) {
    
    shows.forEach((showObj) => {        

        let showDiv = document.createElement('div');
        showDiv.className = 'show-image-div'

        let img = document.createElement('img');
        img.height = '300';
        // img.src = showObj.image.original;

        if (showObj.image === null) {
            img.alt = 'Image Not Available'
            img.src = '';
        } else {
            img.src = showObj.image.original;
        }

        displayedShows.append(showDiv);
        showDiv.append(img);

        // mouseover to see change button and season/episode info
        showDiv.addEventListener('mouseenter', () => {
            img.style.filter = "blur(10px)";

            let overlayDiv = document.createElement('div');
            overlayDiv.className = 'overlay-div';
            showDiv.append(overlayDiv);

            renderOverlay(showObj, overlayDiv);

            showDiv.addEventListener('mouseleave', () => {
                img.style.filter = '';
                overlayDiv.remove();
            });
            
        });        
    });
};

function renderOverlay(showObj, overlayDiv) {

    let textOverlay = document.createElement('div');
    textOverlay.textContent = showObj.name;
    textOverlay.className = 'text-overlay';
    overlayDiv.append(textOverlay);

    let buttonDiv = document.createElement('div');

    // button to delete show
    let deleteButton = document.createElement('button');
    deleteButton.textContent ='❎';
    deleteButton.className = 'delete-button';

    deleteButton.addEventListener('click', () => {
        console.log('deleting this show');

        fetch(`${baseURL}/show/${showObj.id}`,{
            method: 'DELETE'
        })
        .then((response) => response.json())
        .then((data) => {
            fetchData(clickedCategory);
        });
    });

    // button to fetch a new show if it's the wrong one
    let refreshButton = document.createElement('button');
    refreshButton.textContent ='🔄';
    refreshButton.className = 'refresh-button';

    refreshButton.addEventListener('click', () => {
        console.log('refresh show'); 

        let refreshForm = document.createElement('form');
        refreshForm.className = 'refresh-form';
        overlayDiv.insertBefore(refreshForm, changeButton);

        let refreshSelect = document.createElement('select');
        refreshSelect.className = 'refresh-select';
        refreshForm.append(refreshSelect);

        let firstOption = document.createElement('option');
        firstOption.textContent = 'Select - ';
        firstOption.hidden = 'hidden';
        refreshSelect.append(firstOption)

        let showURL = encodeURIComponent(showObj.name);

        // select new show and PATCH to replace with new selection
        fetch(`${searchURL}${showURL}`)
            .then((response) => response.json())
            .then((data) => {

                // get rid of id and add select options 
                data.forEach((eachShow, index) => {
                    delete eachShow.show.id;
                    eachShow.show.category = clickedCategory;

                    let refreshOption = document.createElement('option');
                    refreshOption.textContent = `${eachShow.show.name}: (Premiered ${eachShow.show.premiered})`
                    refreshOption.dataset.id = index;

                    refreshSelect.append(refreshOption);
                });

                let refreshSelection;
                let fullRefreshSelection;

                refreshSelect.onchange = () => {
                    refreshSelection = refreshSelect.options[refreshSelect.selectedIndex]

                    fullRefreshSelection = data[refreshSelection.dataset.id].show;

                    // take the selected show and refresh show
                    refreshShow(fullRefreshSelection, showObj);

                }
            });
    });

    buttonDiv.append(deleteButton, refreshButton);
    overlayDiv.append(buttonDiv);

    // add button to change category
    let changeButton = document.createElement('button');
    changeButton.textContent = 'Change Category';
    changeButton.className = 'change-button';

    overlayDiv.append(changeButton);

    changeButton.addEventListener('click', () => {

        // create form with selection to change category
        let changeForm = document.createElement('form');
        changeForm.className = 'change-form';
        overlayDiv.append(changeForm);

        let changeSelect = document.createElement('select');
        changeSelect.className = 'change-select';
        changeForm.append(changeSelect);

        let hiddenOption = document.createElement('option');
        hiddenOption.textContent = 'Select Category';
        hiddenOption.hidden = 'hidden';
        changeSelect.append(hiddenOption);

        // excluding 'all shows' from option creation
        categories.slice(0,-1).forEach((category) => {
            let option = document.createElement('option');
            option.textContent = category.displayName;
            option.id = category.option;

            changeSelect.append(option);
        });

        changeSelect.onchange = () => {
            let changeSelection = changeSelect.options[changeSelect.selectedIndex];

            let updateShowObj = {
                category: changeSelection.id
            };

            // patch request to change db.json location
            fetch(`${baseURL}/show/${showObj.id}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(updateShowObj)
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                fetchData(clickedCategory);
            });
        }
    }, {once: true});
};

function refreshShow(fullRefreshSelection, showObj) {

    fetch(`${baseURL}/show/${showObj.id}`, {
        method: "PATCH",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(fullRefreshSelection)
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        fetchData(clickedCategory);
    });

};

// on form submit, reads input and category and creates the url to grab the show object 
showSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('new show added');

    let input = e.target['input-show-search'].value;

    // grabs the id name of the category which is used to make the show URL
    let selectElement = e.target['input-show-category'];
    let selectCategoryName = selectElement.options[selectElement.selectedIndex].id;

    let showURL = encodeURIComponent(input);
    let completeShowURL = `${singlesearchURL}${showURL}`

    // check if url exists


    if (selectCategoryName === '') {
        alert('Please select category.')
    } else {
        fetch(completeShowURL)
            .then((response) => response.json())
            .then((data) => {

                // removes id from API and adds assigned category to object 
                delete data.id;
                data.category = selectCategoryName;
                
                postNewShow(data);
            })
            .catch((error) => {
                alert('Please enter valid show name.');
            })
    };
});

// posts new array in db.json with category information and refetches data for clicked category
function postNewShow(showObj) {

    fetch(`${baseURL}/shows`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(showObj),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            fetchData(clickedCategory);
        });
};

