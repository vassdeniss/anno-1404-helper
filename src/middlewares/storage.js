import { createStorage } from '../util.js';

export function addStorage(ctx, next) {
  ctx.game = gameStorage.get();
  ctx.setGame = setGame.bind(ctx);
  ctx.islands = islandStorage.get();
  ctx.setIslands = setIslands.bind(ctx);

  next();
}

const gameStorage = createStorage('activeGame');
const islandStorage = createStorage('islands');

function setGame(game) {
  this.game = game;
  gameStorage.set(game);
}

function setIslands(islands) {
  this.islands = islands;
  islandStorage.set(islands);
}