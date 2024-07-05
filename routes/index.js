import { Router } from './Router.js'
import {
  apiGetPokemonRtr,
  apiPokemonRtr,
  hxGetPokemonRtr,
  hxListPokemonRtr,
  webDeleletePokemonRtr,
  webNewPokemonRtr,
} from './pokemon.js'
import { srvFl } from '../deps.js'

export const router = new Router()

const home = (req) => {
  return srvFl(req, './public/index.html')
}
const poke = (req) => {
  return srvFl(req, './public/pokemon/index.html')
}
const newPoke = (req) => {
  return srvFl(req, './public/pokemon/new/index.html')
}

router.get('/', home)
router.get('/pokemon/new', newPoke)
router.post(webNewPokemonRtr.POST.route, webNewPokemonRtr.POST.handler)
router.post(
  webDeleletePokemonRtr.POST.route,
  webDeleletePokemonRtr.POST.handler,
)
router.get('/pokemon/:id', poke)
router.get(apiGetPokemonRtr.GET.route, apiGetPokemonRtr.GET.handler)
router.delete(apiGetPokemonRtr.DELETE.route, apiGetPokemonRtr.DELETE.handler)
router.get(apiPokemonRtr.GET.route, apiPokemonRtr.GET.handler)
router.get(hxGetPokemonRtr.GET.route, hxGetPokemonRtr.GET.handler)
router.get(hxListPokemonRtr.GET.route, hxListPokemonRtr.GET.handler)
