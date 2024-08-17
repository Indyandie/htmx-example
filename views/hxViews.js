import {
  createPokemon,
  deletePokemon,
  getPokemon,
  KANTO_POKEDEX_OG,
  listPokemon,
  updatePokemon,
} from '../services/pokemon.js'

import { htmlNotFound } from '../services/web.js'

const htmlNewForm = (
  pokemon,
  prop = false,
  message = false,
  edit = false,
) => {
  const editHxSel = `hx-select="form, article"`
  const hxSwap = `hx-swap="outerHTML"`
  const hxTarget = `hx-target="form"`
  const hx = `${hxTarget} ${hxSwap}`

  return `<form
  ${
    !edit
      ? 'hx-put="/hx/pokemon"'
      : 'hx-patch="/hx/pokemon/' + pokemon.id + '"'
  } ${hx} ${editHxSel}
  >
  <h1> ${!edit ? 'New Pokemon' : 'Edit ' + pokemon.id} </h1>
  ${edit ? '<img src="' + pokemon.sprite + '" alt="${name}" />' : ''}
  <div>
    <label for="name">name</label>
    <span>${prop && 'name' === prop ? message : ''}</span>
    <br />
    <input id="name" type="text" name="name" value="${
    pokemon !== undefined ? pokemon.name : ''
  }" required autocomplete="off"/>
  </div>
  <div>
    <label for="weight">weight</label>
    <span>${prop && 'weight' === prop ? message : ''}</span>
    <br />
    <input id="weight" type="number" name="weight" min="1" value="${
    pokemon !== undefined ? pokemon.weight : ''
  }" required />
  </div>
  <div>
    <label for="height">height</label>
    <span>${prop && 'height' === prop ? message : ''}</span>
    <br />
    <input id="height" type="number" name="height" min="1" value="${
    pokemon !== undefined ? pokemon.height : ''
  }" required />
  </div>
  <div>
    <label for="types">types</label>
    <span>${prop && 'types' === prop ? message : ''}</span>
    <br />
    <input id="types" type="text" name="types" list="pokemonmon-types" value="${
    pokemon !== undefined ? pokemon.types : ''
  }" required />
    <datalist id="pokemonmon-types">
      <option value="normal"></option>
      <option value="grass"></option>
      <option value="water"></option>
      <option value="fire"></option>
      <option value="rock"></option>
    </datalist>
  </div>
  <div>
    <label for="sprite">sprite</label>
    <span>${prop && 'sprite' === prop ? message : ''}</span>
    <br />
    <input id="sprite" type="url" name="sprite" value="${
    pokemon !== undefined ? pokemon.sprite : ''
  }" required />
  </div>
  <button type="submit">${!edit ? 'Create Pokemon' : 'Update Pokemon'}</button>
</form>`
}

function htmlTemplate(
  title,
  body,
  meta = null,
  redirect = null,
  delay = 0,
) {
  const html = `<!doctype html>
<html lang="en" dir="auto">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    ${meta ? meta : ''}
    ${
    !redirect
      ? ''
      : '<meta http-equiv="Refresh" content="' + delay + ", url='" + redirect +
        '\'" >'
  }
    <title>${title}</title>
    <script src="/public/js/htmx.min.js"></script>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔴</text></svg>" />
  </head>
  <body>
    <header>
      <h1><a href="/hx">Pokemon</a></h1>
    </header>
    ${body}
  </body>
</html>`

  return html
}

/**
 * Get all pokemon an return an unorder list with embedded dialogs.
 * @param {string} [query] - filter pokemon by name
 * @returns {(html|false)} HTML fragment
 */
export const hxListPokemon = async (
  query = false,
  limit = 151,
  offset = 1,
  paging = false,
) => {
  // lsp keeps telling me await has no effect but when I remove it things break...
  const pokemon = await listPokemon(query, limit, offset)
  const now = Date.now()

  let loadMoreBtn
  offset = offset + limit
  if (paging != -false) {
    if (offset >= KANTO_POKEDEX_OG || query !== false) {
      loadMoreBtn = null
    } else {
      const hxSel = `hx-select="ul > li"`
      if (paging === 'button') {
        const hxSwap = `hx-swap="outerHTML show:top"`
        const hxGet =
          `hx-get="/hx/pokemon?offset=${offset}&limit=${limit}&paging=button"`
        loadMoreBtn =
          `<li><button ${hxGet} ${hxSel} ${hxSwap}>Load More</button></li>`
      } else if (paging === 'infinite') {
        const hxSwap = `hx-swap="outerHTML"`
        const hxGet =
          `hx-get="/hx/pokemon?offset=${offset}&limit=${limit}&paging=infinite"`
        loadMoreBtn =
          `<li><div hx-trigger="revealed" ${hxGet} ${hxSel} ${hxSwap}>Load More</div></li>`
      }
    }
  } else {
    loadMoreBtn = null
  }

  if (query && pokemon < 1) {
    return `<p id="pokemon-results">No pokemon results for <b>${query}</b></p>`
  } else {
    const html = pokemon.map(
      (
        poke,
      ) => {
        const { id, name, sprite } = poke

        // htmx
        const hxGet = `hx-get="/hx/pokemon/${id}"`
        const hxTrigger = `hx-trigger="intersect"`
        const hxSel = `hx-select="article"`
        const hxSwap = `hx-swap="innerHTML"`
        const hxTarget = `hx-target="this"`
        const hx = `${hxGet} ${hxTrigger} ${hxSel} ${hxTarget} ${hxSwap}`
        const articleHx = `<article></article>`

        const btnId = `show-dialog-${name}`
        const pokeUTID = `${name}${now}`
        const dialogId = `${pokeUTID}Dialog`

        // html
        const pokeFigure =
          `<figure><img src="${sprite}" alt="${name}" /><figcaption>${name}</figcaption></figure>`
        const pokeDialog =
          `<dialog id="${dialogId}" ${hx}>${articleHx}<button autofocus>Close</button></dialog>`

        // javascript
        const pokeScript =
          `<script>const ${dialogId} = document.querySelector("#${dialogId}");const ${pokeUTID}ShowButton = document.querySelector("#${btnId}");const ${pokeUTID}CloseButton = document.querySelector("#${dialogId} button");${pokeUTID}ShowButton.addEventListener("click", () => {${dialogId}.showModal();});${pokeUTID}CloseButton.addEventListener("click", () => {${dialogId}.close();});</script>`

        return `<li id="pokemon-${id}-list" class="poke-${id}"><button id="${btnId}">${pokeFigure}</button>${pokeDialog}${pokeScript}`
      },
    )
    html.unshift('<ul id="pokemon-results">')
    html.push(loadMoreBtn)
    html.push('</ul>')

    return JSON.stringify(html.join('')).replace(/\\"/g, '"').slice(
      1,
      -1,
    )
  }
}

/**
 * Get a pokemon and return an article.
 * @param {number} id - pokemon id
 * @returns {(html|false)} HTML fragment
 */
export const hxGetPokemon = async (id) => {
  const { code, pokemon: poke } = await getPokemon(id)

  if (code === 200) {
    const { id, name, cries, weight, height, types, sprite, official } = poke

    const articleID = `article${name}${id}`

    // htmx
    const hxSwap = `hx-swap="outerHTML"`
    const hxTarget = `hx-target="#${articleID}"`

    // edit
    const editHxSel = `hx-select="form"`
    const editAction =
      `<button hx-get="/hx/pokemon/${id}/edit" ${editHxSel} ${hxSwap} ${hxTarget}>edit</button>`

    // delete
    const deleteHxSel = `hx-select="dialog"`
    const deleteHxSwap = `hx-swap="afterbegin"`
    const deleteHxTarget = `hx-target="body"`
    const deleteHxConfirm = `hx-confirm="Delete ${name}?"`
    const deleteAction =
      `<button hx-delete="/hx/pokemon/${id}" ${deleteHxSel} ${deleteHxSwap} ${deleteHxTarget} ${deleteHxConfirm}>delete</button>`

    const customActions = !official ? `${deleteAction}${editAction}` : ''

    const criesTr = cries
      ? `<tr><th>cries</th><td><audio controls controlslist="nodownload"><source src="${cries}" type="audio/ogg"></source><p>audio is not supported</p></audio></td></tr>`
      : ''

    const html =
      `<article id="${articleID}"><h1><a href="/hx/pokedex/${id}">${name}</a></h1><img src="${sprite}" alt="${name}" /><table><tr><th>weight</th><td>${weight}</td></tr><tr><th>height</th><td>${height}</td></tr><tr><th>type</th><td>${types}</td></tr>${criesTr}</table>${customActions}</article>`

    return {
      code,
      html,
    }
  }

  return {
    code,
    html: 'not found',
  }
}

export const hxEditPokemon = async (pokemonId, pokemonObj = null) => {
  if (pokemonObj === null) {
    const pokeReturn = await getPokemon(pokemonId)
    const { code, pokemon, error, message } = pokeReturn

    if (!pokemon) {
      const body = `<code>${error}: ${message}</code><br><br>`
      return { code: 404, html: body }
    }

    if (pokemon.official) {
      const officialForbidden = `<b>${pokemon.name}</b> cannot be edited`
      return {
        code: 403,
        html: officialForbidden,
      }
    }

    if (code === 200) {
      return {
        code,
        html: await htmlNewForm(pokemon, false, false, true),
      }
    }
  } else {
    const pokeReturn = await updatePokemon(pokemonObj)
    const { code, pokemon, prop, error, message } = pokeReturn

    if (code === 403) {
      const officialForbidden = !pokemon
        ? `<h1>${error}</h1><code>${message}</code>`
        : `<b>${pokemon.name}</b> cannot be edited`
      return {
        code,
        html: officialForbidden,
      }
    }

    if (code === 404) {
      const body = `<code>${error}: ${message}</code><br><br>`
      return {
        code,
        html: body,
      }
    }

    if (code === 200) {
      return hxGetPokemon(pokemonId)
    }

    return {
      code: 200, // override error status
      html: htmlNewForm(pokemonObj, prop, message, true),
    }
  }
}

export async function hxNewPokemon(pokemonObj = false) {
  if (pokemonObj === false) {
    return {
      code: 200,
      html: await htmlNewForm(),
    }
  }

  const newPokemon = await createPokemon(pokemonObj)
  const { code, prop, message, pokemon } = newPokemon

  if (code === 201) {
    const { html } = await hxGetPokemon(pokemon.id)

    return {
      code,
      html,
    }
  } else {
    const html = await htmlNewForm(pokemonObj, prop, message)

    return {
      code: 200,
      html,
    }
  }
}

export const hxDeletePokemon = async (pokemonId) => {
  const { code, error, message, pokemon } = await deletePokemon(pokemonId)

  if (code === 200) {
    const { id, name } = pokemon
    const deletedPokemon = await JSON.stringify(pokemon, null, '<br>')

    const message = `<p><strong>${name} (${id}) has been deleted</strong><p>`
    const object = `<code>${deletedPokemon}</code>`
    const closeButton = `<form method="dialog"><button>close</button></form>`
    const dialogId = `delete-notification-${id + name}`
    const script = `<script>
    const rmPoke${id} = document.querySelectorAll(".poke-${id}")
    rmPoke${id}.forEach(el => el.remove())
    const rmNotification${id + name} = document.querySelector("#${dialogId}")
    setTimeout(() => {
      rmNotification${id + name}.close()
      setTimeout(() => {
        rmNotification${id + name}.remove()
      }, 1000)
    }, 5000)
</script>`

    const html =
      `<dialog open id="${dialogId}" style="position: fixed; top: 0;">${message}${object}${script}${closeButton}</dialog>`

    return {
      code,
      html,
    }
  } else {
    const html = `<code>${error}: ${message}</code><br><br>`
    console.log(html)

    return { code, html }
  }
}

export async function hxPokedex(id = false) {
  const pokemonReturn = id ? await getPokemon(id) : null
  const { code, pokemon } = pokemonReturn

  if (code === 200) {
    const title = pokemon.name
    const htmlReturn = await hxGetPokemon(id)
    const { html: article } = htmlReturn
    const body = article

    const html = htmlTemplate(title, body)

    return { code: 200, html }
  }
    return { code: 200, html: htmlNotFound()}
}