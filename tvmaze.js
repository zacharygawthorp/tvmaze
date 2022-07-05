"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $searchInput = $("#search-query")
const missingImage = "http://tinyurl.com/missing-tv";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`)
  let results = response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : missingImage
    }
  })
  return results;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  const $showsList = $("#shows-list")
  $showsList.empty();

  for (let show of shows) {
    const $item = $(
        ` <div class="Show" data-show-id="${show.id}">
            <div class="media" data-show-id="${show.id}">
              <img class="card-img-top" src="${show.image}">
              <div class="media-body">
                <h5 class="text-primary">${show.name}</h5>
                <p class="media-text">${show.summary}</p>
                <button class="episode-btn get-episodes">Episodes</button>
           </div>
          </div>  
         </div>
      `);
        
     $showsList.append($item);  
    }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", $searchForm, async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
  $searchForm.trigger('reset');
})

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

async function getEpisodes(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  return episodes;
}

/** Populate episodes list:
 *     - given list of episodes, add espiodes to DOM
 */

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for(let episode of episodes) {
    let $item = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      <li>`
    );

    $episodesList.append($item);
  }

  $("#episodes-area").show();
}

/** Handle click on show name. */

$("#shows-list").on("click", ".get-episodes", async function (evt) {
  let showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});