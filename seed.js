import { stringify as csvStringify } from 'csv'

/**
 * @typedef {Object} Pokemon
 * @property {number} id
 * @property {string} name
 * @property {number} weight
 * @property {number} height
 * @property {string} types
 * @property {string} sprite - URL
 * @property {string} cries - URL
 * @property {boolean} official - Official pokemon
 */

/**
 * Fetch pokemon data and return filter object.
 * @param {string} url - https://pokeapi.co/api/v2/pokemon/:id
 * @returns {Pokemon} pokemon: id, name, weight, height, types, sprite, cries
 */
async function fetchPokeData(url) {
  const resp = await fetch(url)
  const text = await resp.text()
  const data = JSON.parse(text)
  const pokeData = {
    id: data.id,
    name: data.name,
    weight: data.weight,
    height: data.height,
    types: data.types[0].type.name,
    sprite: data.sprites['front_default'],
    cries: data.cries.latest,
    official: true,
  }
  return pokeData
}

/**
 * @typedef {Object} PokemonItem
 * @property {number} name
 * @property {string} url - URL
 */

/**
 * Get list of pokemon.
 * @param {number} totalPokemon - Total number of pokemon.
 * @returns {PokemonItem[]} Array of PokemonItem
 */
async function getPokemonList(totalPokemon) {
  if (!totalPokemon) {
    totalPokemon = 151
  }

  let pokeList = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`,
  )

  pokeList = await pokeList.text()
  pokeList = JSON.parse(pokeList).results

  return pokeList
}

/**
 * @param {PokemonItem[]} pokeList
 */
const pokeList = await getPokemonList(1025)

const pokemap = await Promise.all(
  pokeList.map((poke) => fetchPokeData(poke.url)),
)

/**
 * @param {string} pokeCSV - CSV string
 */
let pokeCSV = csvStringify(await pokemap, {
  columns: [
    'id',
    'name',
    'weight',
    'height',
    'types',
    'sprite',
    'cries',
    'official',
  ],
})

pokeCSV = pokeCSV.replace(/-/g, '_')

/**
 * Write pokemon data to `/models/pokemon.csv` file
 */
await Deno.writeTextFile('./models/pokemon.csv', pokeCSV)
