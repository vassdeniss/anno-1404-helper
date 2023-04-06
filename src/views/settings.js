import { createGame, deleteGame, getGames } from '../data/games.js';
import { html, nothing } from '../lib/lit-html.js';
import { createSubmitHandler } from '../util.js';
import { smallIcon } from './partials.js';

export async function renderSettings(ctx) {
  const games = ctx.user ? await getGames() : [];

  update();

  function update(error) {
    if (ctx.game) {
      games.forEach(
        (game) =>
          (game.active = game.objectId === ctx.game.objectId ? true : false)
      );
    }

    ctx.render(
      settignsTemplate(
        games,
        ctx.user,
        createSubmitHandler(onCreate),
        onDelete,
        onLoad,
        error
      )
    );
  }

  async function onCreate({ name }, form) {
    try {
      if (!name) {
        throw {
          message: 'Name is required!',
        };
      }

      const gameData = { name };

      const result = await createGame(gameData);

      Object.assign(gameData, result);
      games.push(gameData);

      form.reset();

      update();
    } catch (error) {
      update(error.message);
      error.handled = true;
    }
  }

  async function onDelete(index) {
    const game = games[index];

    await deleteGame(game.objectId);
    games.splice(index, 1);

    update();
  }

  async function onLoad(index) {
    const game = games[index];

    ctx.setGame(game);

    update();
  }
}

const settignsTemplate = (
  games,
  user,
  onCreate,
  onDelete,
  onLoad,
  error
) => html`<h1>Settings Page</h1>
  <section class="main">
    ${user
      ? html` <div class="box">
          <i class="fa-solid fa-user-check"></i> Logged in as ${user.username}.
          <a class="link" href="/logout">Logout</a>
        </div>`
      : html`<div class="box label">
            <a class="link" href="/login">Sign in</a> to enable cloud sync
          </div>
          <br />`}

    <table>
      <thead>
        <tr>
          <th>Game Name</th>
          <th>Controls</th>
        </tr>
      </thead>
      <tbody>
        ${games.length === 0
          ? html`<tr>
              <td colspan="2">No games recorded!</td>
            </tr>`
          : games.map((g, i) =>
              gameTemplate(g, onDelete.bind(null, i), onLoad.bind(null, i))
            )}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">
            <form @submit=${onCreate}>
              ${error ? html`<p class="error">${error}</p>` : nothing}
              <input type="text" name="name" placeholder="Game Name" />
              <button class="btn">
                <i class="fa-solid fa-plus"></i> Create
              </button>
            </form>
          </td>
        </tr>
      </tfoot>
    </table>
  </section>`;

const gameTemplate = (game, onDelete, onLoad) =>
  html`<tr>
    <td>
      ${game.active ? smallIcon('arrow', 'left') : null}<span class="label left"
        >${game.name}</span
      >
    </td>
    <td>
      <button @click=${onLoad} class="btn">
        <i class="fa-solid fa-download"></i> Load
      </button>
      <button @click=${onDelete} class="btn">
        <i class="fa-solid fa-trash-can"></i> Delete
      </button>
    </td>
  </tr>`;
