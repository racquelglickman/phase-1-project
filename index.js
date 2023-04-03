// 🚨 
// 4. Click button to change show category
// 5. When adding a new show, option to reject the first show found in the API
// 6. Mouseover a show and see what season/episode you're up to 
// 7. Option to display additional show details

// next step 🚨 - build an h3 element and selection option for each of the objects in 'categories' instead of hard-coding the elements

let navOptions = document.querySelectorAll('nav h3');

let showSearch = document.querySelector('#show-search');
let inputShowSearch = document.querySelector('input-show-search');

let displayedShows = document.querySelector('#displayed-shows');

let categories = [
    {
        option: 'currently',
        displayName: 'Currently Watching',
        element: navOptions[0],
        dropDown: true,
    },
    {
        option: 'future',
        displayName: 'Future Watching',
        element: navOptions[1],
        dropDown: true,
    },
    {
        option: 'finished',
        displayName: 'Finished Watching',
        element: navOptions[2],
        dropDown: true,
    },
    {
        option: 'allShows',
        displayName: 'All Shows',
        element: navOptions[3],
        dropDown: false,
    },
];

// when the page loads, default load the shows from currently into displayed-shows
let clickedCategory = 'currently';
categories[0].element.style.textShadow = '1px 1px 2px';
fetchData(categories[0].option);

// add 'click' and 'mouseover' event listeners to each nav bar choice
navOptions.forEach((navChoice) => {
    
    // selected nav category (full name) -> name of correct array in db.json (one word)
    let navCategory = (navChoice.textContent.split(' ')[0]).toLowerCase();

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

    fetch(`http://localhost:3000/${category}`)
        .then((response) => response.json())
        .then((data) => {
            displayedShows.innerHTML ='';
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

        showDiv.addEventListener('mouseenter', () => {
            console.log(showObj.name);
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

// mouseover show to see details and changeButton
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
        console.log('button clicked')
    })

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
            postNewShow(data, selectCategoryName);
        });
});

// posts new show in correct array in db.json and re-fetches data for that category (if it's clicked category then it re-renders with new show added)
function postNewShow(showObj, selectCategoryName) {

    console.log(showObj)
    fetch(`http://localhost:3000/${selectCategoryName}`, {
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





