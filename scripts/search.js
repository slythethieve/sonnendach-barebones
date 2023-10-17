function getAdressData(adressString) {
  let url = `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${adressString}&type=locations`
  return $.getJSON(url)
}

function getSolarInfo(adressData) {
  let url = `https://api3.geo.admin.ch//rest/services/api/MapServer/identify?geometryType=esriGeometryPoint&returnGeometry=true&layers=all:ch.bfe.solarenergie-eignung-daecher&geometry=${adressData.box}&tolerance=0&order=distance&lang=de`
  return $.getJSON(url)
}

async function parseAdressData(adressString) {
  let response = await getAdressData(adressString)
  let adressData = null
  let regex = /(\d+(?:\.\d+)?)\s(\d+(?:\.\d+)?)(?=,)/gm
  if (Object.keys(response.results).length !== 0) {
    adressData = {
      x_coord: response.results[0].attrs.x,
      y_coord: response.results[0].attrs.y,
      box: response.results[0].attrs.geom_st_box2d
        .match(regex)
        .toString()
        .replace(/[ ]+/g, ", "),
      label: response.results[0].attrs.label,
    }
  }
  return adressData
}

async function parseSolarInfo(adressData) {
  let response = await getSolarInfo(adressData)
  let solarInfo = null
  let regex = /^[^#]+/gm
  if (Object.keys(response.results).length !== 0) {
    solarInfo = {
      id: response.results[0].id,
      aptitude: response.results[0].attributes.klasse_text.match(regex),
      area: response.results[0].attributes.flaeche,
      buildingId: response.results[0].attributes.building_id,
      inclination: response.results[0].attributes.neigung,
      orientation: response.results[0].attributes.ausrichtung,
    }
  }
  return solarInfo
}

export { parseAdressData, parseSolarInfo }
