import { createMap, loadMapViewFromCoord } from "./map.js"
import { parseAdressData, parseSolarInfo } from "./search.js"

const SEARCH_BOX = document.querySelector(".search-box")
const TABLE = document.querySelector(".table")
const NOT_LOCATED_HEADER = document.querySelector(".not-located h3")
const NOT_LOCATED_SPAN = document.querySelector(".not-located span")

createMap("map", "de")

SEARCH_BOX.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    let str = SEARCH_BOX.value.replace(/[ ,]+/g, "/").toLowerCase()
    SEARCH_BOX.value = ""
    handleInput(str)
  }
})

async function handleInput(str) {
  let adressData = await parseAdressData(str)
  if (adressData != null) {
    let solarData = await parseSolarInfo(adressData)
    loadMapViewFromCoord(adressData)
    updatePageInfo(adressData, solarData)
  } else {
    alert(`Es wurde keine gültige Adresse gefunden unter: ${str}`)
  }
}

function updatePageInfo(adressData, solarData) {
  let inputString = adressData.label
  let outputString = inputString.replace(/<\/?b>/g, function (match) {
    return match === "<b>" ? "<br>" : "</br>"
  });

  NOT_LOCATED_HEADER.innerHTML = outputString
  NOT_LOCATED_SPAN.style.display = "none"

  for (let cellId in solarData) {
    let cellElement = document.getElementById(cellId)
    cellElement.textContent = solarData[cellId]
  }
  TABLE.style.display = "flex"
}
