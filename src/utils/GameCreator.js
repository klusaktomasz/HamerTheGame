'use strict';

import {database} from '../utils';

/**
 * Class representing GameCreator.
 */
class GameCreator
{
  /**
   * Creates GameCreator instance.
   */
  constructor ()
  {
    this._db = database.ref('games');

    this.gameLast = 5;

    this.champions = [
      'kamil',
      'ninja',
      'rambo'
    ];
  }

  /**
   * Creates new game in database.
   *
   * @param {string} id Game's id.
   * @param {string} name Game's name.
   * @param {object} players Game's players.
   * @param {string} map Game's map.
   * @param {string} gameType Game's type.
   */
  create (id, name, players, map, gameType)
  {
    if (typeof id !== 'string' || !id) throw new TypeError('`id` must be a non-empty string');
    if (typeof name !== 'string' || !name) throw new TypeError('`name` must be a non-empty string');
    if (typeof players !== 'object' || !players) throw new TypeError('`players` must be an non-empty object');
    if (typeof map !== 'string' || !map) throw new TypeError('`map` must be a non-empty string');
    if (typeof gameType !== 'string' || !gameType) throw new TypeError('`gameType` must be a non-empty string');

    const gameStartConfig = {
      name: name,
      map: map,
      gameType: gameType,
      players: this._createPlayersConfig(players),
      startTimestamp: Date.now(),
      endTimestamp: new Date(Date.now()).setMinutes(new Date(Date.now()).getMinutes() + this.gameLast)
    };

    this._db.update({
      [id]: gameStartConfig
    });
  }

  /**
   * Creates players' config for the game.
   *
   * @param {object} players Players' list.
   * @private
   * @returns {object}
   */
  _createPlayersConfig (players)
  {
    const playersConfig = {};
    for (let pKey in players)
    {
      if (players.hasOwnProperty(pKey) === false) continue;

      if (this.champions.includes(players[pKey].skin) === false) players[pKey].skin = this.champions[0];

      playersConfig[pKey] = {
        name: players[pKey].name,
        skin: players[pKey].skin,
        online: false,
        hp: 100,
        respawn: 0,
        position: {
          x: 32,
          y: 32
        },
        cursor: {
          x: 32,
          y: 32
        },
        stats: {
          kills: 0,
          deaths: 0
        }
      };
    }

    return playersConfig;
  }
}

export default GameCreator;
