// next step 🚨 - build an h3 element and selection option for each of the objects in 'categories' instead of hard-coding the elements
// need to add 🚨 option to reject the show and go to the next approximation
// mouseover to make the textshadow
// button to add a show to new category
// mouseover show to see title - what season and episode?


let navOptions = document.querySelectorAll('nav h3');

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

console.log(categories);


let showSearch = document.querySelector('#show-search');
let inputShowSearch = document.querySelector('input-show-search');

let displayedShows = document.querySelector('#displayed-shows');

// when the page loads, default load the shows from current into displayed-shows
let clickedCategory = 'currently';
categories[0].element.style.textShadow = '1px 1px 2px';
fetchData(categories[0].option);

// add event listeners to each nav bar choice
navOptions.forEach((navChoice, index) => {

    console.log(navChoice, index)
    let h3 = document.createElement('h3');
    navChoice.textContent = categories[index].displayName;

    navChoice.addEventListener('click', () => {
        console.log(`${navChoice.textContent} was clicked`);

        // reset all dataset.clicks to false when you click
        navOptions.forEach((nav) => {
            nav.style.textShadow = '';
        })

        navChoice.style.textShadow = '1px 1px 2px';

        // selected nav category -> name of correct array in db.json
        let navCategory = (navChoice.textContent.split(' ')[0]).toLowerCase();
        clickedCategory = navCategory;

        fetchData(clickedCategory);
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

        let img = document.createElement('img');
        img.src = showObj.image.original;
        img.height = '300';

        displayedShows.append(img);
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

    fetch(`https://api.tvmaze.com/singlesearch/shows?q=${showURL}`)
        .then((response) => response.json())
        .then((data) => {
            delete data.id;
            postNewShow(data, selectCategoryName);
        });
});

// posts new show in correct array in db.json and re-render 
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





