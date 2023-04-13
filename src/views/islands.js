import { updateGame } from '../data/games.js';
import { createIsland, deleteIsland, updateIsland } from '../data/islands.js';
import { html } from '../lib/lit-html.js';
import { createSubmitHandler, createUrl } from '../util.js';

export async function renderIslands(ctx) {
  const game = ctx.game;
  if (!game) {
    ctx.page.redirect('/settings');
    alert('No loaded game found!');
    return;
  }

  const islands = ctx.islands;

  update();

  function update() {
    ctx.render(
      islandsTemplate(
        islands,
        createSubmitHandler(onCreate),
        onDelete,
        onRename,
        onMove
      )
    );
  }

  async function onCreate({ name }, form) {
    if (!name) {
      return alert('Please enter a name.');
    }

    const island = {
      name,
      game: ctx.game.objectId,
      url: createUrl(name),
    };

    const result = await createIsland(island);
    Object.assign(island, result);
    islands.push(island);
    game.islands.push(island.objectId);
    ctx.setIslands(islands);

    updateGame(game.objectId, game).then(() => ctx.setGame(game));

    form.reset();

    update();
  }

  async function onDelete() {
    const id = this.objectId;

    const index = islands.findIndex((island) => island.objectId === id);
    if (index === -1) {
      return alert('Island not found, please reload game!');
    }

    const choice = confirm(
      `Are you sure you want to delete ${islands[index].name}?`
    );
    if (!choice) {
      return;
    }

    await deleteIsland(id);
    islands.splice(index, 1);
    game.islands.splice(index, 1);
    ctx.setIslands(islands);

    updateGame(game.objectId, game).then(() => ctx.setGame(game));

    update();
  }

  async function onRename() {
    const id = this.objectId;

    const index = islands.findIndex((island) => island.objectId === id);
    const island = islands[index];

    const newName = prompt(`Enter new name for ${island.name}`, island.name);

    if (newName) {
      island.name = newName;
      island.url = createUrl(newName);

      const result = await updateIsland(id, island);
      Object.assign(island, result);
      ctx.setIslands(islands);

      update();
    }
  }

  async function onMove(order) {
    const id = this.objectId;

    const oldIndex = islands.findIndex((island) => island.objectId === id);
    const island = islands[oldIndex];

    if (typeof order !== 'number') {
      const input = prompt('Enter new order', oldIndex + 1);
      order = Number(input);
      if (input == null || input == '' || !Number.isInteger(order)) {
        return;
      }
    }

    let newIndex = order - 1;
    if (newIndex < 0) {
      newIndex = 0;
    }
    if (newIndex >= islands.length) {
      newIndex = islands.length - 1;
    }

    islands.splice(oldIndex, 1);
    islands.splice(newIndex, 0, island);

    game.islands = islands.map((island) => island.objectId);
    await updateGame(game.objectId, game);

    ctx.setIslands(islands);
    ctx.setGame(game);

    update();
  }
}

const islandsTemplate = (islands, onSubmit, onDelete, onRename, onMove) =>
  html`<h1>Islands Overview</h1>
    <section class="main">
      <table>
        <thead>
          <tr>
            <th class="wide">Order</th>
            <th>Name</th>
            <th class="wide">Population</th>
            <th>Details</th>
            <th class="wide">Controls</th>
          </tr>
        </thead>
        <tbody>
          ${islands.map((island, index) =>
            islandRow(
              index,
              island,
              onDelete.bind(island),
              onRename.bind(island),
              onMove.bind(island)
            )
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">
              <form @submit=${onSubmit}>
                <input type="text" name="name" />
                <button class="btn">
                  <i class="fa-solid fa-plus"></i> Create
                </button>
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>`;

const islandRow = (index, island, onDelete, onRename, onMove) => html`<tr>
  <td class="wide">
    <div class="btn-grid">
      <button class="btn" @click=${onMove.bind(null, index)}>
        <i class="fa-solid fa-arrow-up"></i>
      </button>
      <button class="btn" @click=${onMove.bind(null, index + 2)}>
        <i class="fa-solid fa-arrow-down"></i>
      </button>
    </div>
  </td>
  <td>
    <span class="label prim">${island.name}</span>
    <span class="label sub narrow">Population:&nbsp;PLACEHOLDER</span>
    <div class="grid narrow">
      <button @click=${onMove} class="btn">
        <i class="fa-solid fa-arrow-down-up-across-line"></i>
      </button>
      <button @click=${onRename} class="btn">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button @click=${onDelete} class="btn">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  </td>
  <td class="wide">
    <span class="label prim">PLACEHOLDER</span>
  </td>
  <td>
    <div class="btn-grid">
      <a class="btn" href="/${island.url}/ascension">Ascension</a>
      <a class="btn" href="/${island.url}/population">Population</a>
      <a class="btn" href="/${island.url}/needs">Needs</a>
      <!-- <a href="/lit$398638298$/industry">Industry</a> -->
    </div>
  </td>
  <td class="wide">
    <div class="btn-grid">
      <button @click=${onRename} class="btn">Rename</button>
      <button @click=${onDelete} class="btn">Delete</button>
    </div>
  </td>
</tr>`;
