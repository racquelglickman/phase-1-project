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

    fetch(`http://localhost:3000/shows/${category}`)
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
        img.src = showObj.image.original;
        img.height = '300';

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

    // add button to change category
    let changeButton = document.createElement('button');
    changeButton.textContent = 'Change Category';
    changeButton.className = 'change-button';
    overlayDiv.append(changeButton);

    changeButton.addEventListener('click', () => {
        console.log('button clicked');
        console.log(clickedCategory)

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
            // console.log(showObj.name, showObj.id);
            // console.log(`http://localhost:3000/shows/${clickedCategory}/${showObj.id}`)
            fetch(`http://localhost:3000/shows/${showObj.id}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(updateShowObj)
            })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });

        }



    }, {once: true});

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

    fetch(`https://api.tvmaze.com/singlesearch/shows?q=${showURL}`)
        .then((response) => response.json())
        .then((data) => {
            delete data.id;

            // adds category to object itself
            data.category = selectCategoryName;
            
            postNewShow(data);
        });
});

// posts new array in db.json with category information and refetches data for clicked category
function postNewShow(showObj) {

    console.log(showObj);

    fetch(`http://localhost:3000/shows`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(showObj),
    })
        .then((response) => response.json())
        .then((data) => {
            fetchData(clickedCategory);
        });
};





