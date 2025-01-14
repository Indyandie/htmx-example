import { createPokemon, deletePokemon, getPokemon, listPokemon, updatePokemon } from '../services/pokemon.js'

import { htmlDeletePokemonPost, htmlEditPokemon, htmlNewPokemonPost, htmlNotFound, htmlPageMain, htmlPokemon } from '../views/webViews.js'

import { hxDeletePokemon, hxEditPokemon, hxGetPokemon, hxListPokemon, hxNewPokemon, hxPokedex } from '../views/hxViews.js'

const status404 = new Response(
  null,
  {
    status: 404,
    statusText: 'Not Found',
  },
)

export const notFoundCtrl = (_req) => {
  return new Response(
    htmlNotFound(),
    {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

// API

export const createPokemonCtrl = async (req) => {
  const pokeReq = await req.json()
  const pokeRes = await createPokemon(pokeReq)
  const { code, error, message, pokemon } = pokeRes

  if (!pokeRes) {
    return status404
  }

  let response
  if (code >= 400) {
    response = {
      error,
      message,
    }
  } else {
    response = pokemon
  }

  return new Response(
    JSON.stringify(response),
    {
      status: code,
      headers: {
        'Content-Type': 'text/json; charset=utf-8',
      },
    },
  )
}

export const listPokemonCtrl = async (req) => {
  const url = new URL(req.url)
  const query = url.searchParams.get('q')
  let limit = url.searchParams.get('limit')
  let offset = url.searchParams.get('offset')
  limit = limit ? limit : 151
  offset = offset ? offset : 0

  return new Response(
    JSON.stringify(await listPokemon(query, limit, offset)),
    {
      headers: {
        'content-type': 'text/json; charset=utf-8',
      },
    },
  )
}

export const getPokemonCtrl = async (_req, match) => {
  const pokeId = match.pathname.groups.id
  const pokeRes = await getPokemon(pokeId)
  const { code } = pokeRes
  let response

  if (!pokeRes) {
    return status404
  }

  if (code === 200) {
    const { pokemon } = pokeRes
    response = pokemon
  } else {
    const { error, message } = pokeRes
    response = {
      error,
      message,
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      status: code,
      headers: {
        'Content-Type': 'text/json; charset=utf-8',
      },
    },
  )
}

export const updatePokemonCtrl = async (req, match) => {
  const pokeId = parseInt(match.pathname.groups.id)
  const pokeReq = await req.json()
  pokeReq.id = pokeId
  const pokeRes = await updatePokemon(pokeReq)
  const { code, error, message, pokemon } = pokeRes

  if (!pokeRes) {
    return status404
  }

  let response
  if (code >= 400) {
    response = {
      error,
      message,
    }
  } else {
    response = pokemon || {
      error,
      message,
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      status: code,
      headers: {
        'Content-Type': 'text/json; charset=utf-8',
      },
    },
  )
}

export const deletePokemonCtrl = async (_req, match) => {
  const pokeId = parseInt(match.pathname.groups.id)
  const pokeRes = await deletePokemon(pokeId)
  const { code, error, message, pokemon } = pokeRes

  if (!pokeRes) {
    return status404
  }

  let response
  if (code >= 400) {
    response = {
      error,
      message,
    }
  } else {
    response = {
      error,
      message,
      pokemon,
    }
  }

  return new Response(
    JSON.stringify(response),
    {
      status: code,
      headers: {
        'Content-Type': 'text/json; charset=utf-8',
      },
    },
  )
}

// web

export async function webNewPokemonCtrl(req) {
  const url = new URL(req.url)
  const origin = url.origin
  const formData = await req.formData()
  const pokemon = {
    name: formData.get('name'),
    height: formData.get('height'),
    weight: formData.get('weight'),
    types: formData.get('types'),
    sprite: formData.get('sprite'),
  }

  const newPokemon = await htmlNewPokemonPost(pokemon)
  const { code, html: body } = newPokemon

  return new Response(
    body,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Location': origin,
      },
    },
  )
}

export async function webHomePokemonCtrl(req) {
  const url = new URL(req.url)
  const query = url.searchParams.get('q') || ''
  const html = await htmlPageMain(query)

  return new Response(
    html,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function webPokemonCtrl(_req, match) {
  const pokeId = match.pathname.groups.id
  const { code, html } = await htmlPokemon(pokeId)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function webEditPokemonCtrl(_req, match) {
  const pokeId = match.pathname.groups.id
  const { code, html } = await htmlEditPokemon(pokeId)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function webUpdatePokemonCtrl(req, match) {
  const pokeId = match.pathname.groups.id
  const formData = await req.formData()
  const pokemonForm = {
    id: pokeId,
    name: formData.get('name'),
    height: formData.get('height'),
    weight: formData.get('weight'),
    types: formData.get('types'),
    sprite: formData.get('sprite'),
  }

  const { code, html } = await htmlEditPokemon(pokeId, pokemonForm)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function webDeletePokemonCtrl(req, match) {
  const pokeId = parseInt(match.pathname.groups.id)
  const url = new URL(req.url)
  const origin = url.origin

  const { code, html: body } = await htmlDeletePokemonPost(pokeId)

  return new Response(
    body,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Location': origin,
      },
    },
  )
}

// htmx

export async function hxNewPokemonCtrl(_req) {
  const { code, html } = await hxNewPokemon(false)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function hxCreatePokemonCtrl(req, match) {
  const formData = await req.formData()
  const pokemonForm = {
    name: formData.get('name'),
    height: formData.get('height'),
    weight: formData.get('weight'),
    types: formData.get('types'),
    sprite: formData.get('sprite'),
  }

  const { code, html } = await hxNewPokemon(pokemonForm)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export const hxListPokemonCtrl = async (req) => {
  const url = new URL(req.url)
  let query = url.searchParams.get('q')
  let limit = url.searchParams.get('limit')
  let offset = url.searchParams.get('offset')
  let paging = url.searchParams.get('paging')

  query = query === null ? false : query
  limit = limit === null ? false : parseInt(limit)
  offset = offset === null ? false : parseInt(offset)
  paging = paging === null ? false : paging

  return new Response(
    await hxListPokemon(query, limit, offset, paging),
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export const hxGetPokemonCtrl = async (_req, match) => {
  const pokeId = match.pathname.groups.id
  const pokeRes = await hxGetPokemon(pokeId, true)
  const { code, html: response } = pokeRes

  if (!pokeRes) {
    return status404
  }

  return new Response(
    response,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function hxEditPokemonCtrl(_req, match) {
  const pokeId = match.pathname.groups.id
  const { code, html } = await hxEditPokemon(pokeId)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export async function hxUpdatePokemonCtrl(req, match) {
  const pokeId = match.pathname.groups.id
  const formData = await req.formData()
  const pokemonForm = {
    id: pokeId,
    name: formData.get('name'),
    height: formData.get('height'),
    weight: formData.get('weight'),
    types: formData.get('types'),
    sprite: formData.get('sprite'),
  }

  const { code, html } = await hxEditPokemon(pokeId, pokemonForm)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export const hxDeletePokemonCtrl = async (_req, match) => {
  const pokeId = parseInt(match.pathname.groups.id)
  const { code, html } = await hxDeletePokemon(pokeId)

  return new Response(
    html,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}

export const hxPokedexCtrl = async (_req, match) => {
  const pokeId = match.pathname.groups.id
  const pokeRes = await hxPokedex(pokeId)
  const { code, html: response } = pokeRes

  if (!pokeRes) {
    return status404
  }

  return new Response(
    response,
    {
      status: code,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  )
}
