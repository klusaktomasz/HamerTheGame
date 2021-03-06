'use strict';

import Phaser from 'phaser';
import {escapeSpecialChars} from './../utils';
import config from './../config';

import Lobbies from './../utils/Lobbies';

export default class extends Phaser.State
{
  init ()
  {
    this.lobbyUI = null;
    this.lobbies = new Lobbies();
  }

  create ()
  {
    this.game.add.image(60, 11, 'm-logo');

    this.createLobbyUI();
  }

  shutdown ()
  {
    this.lobbyUI.remove();
  }

  joinLobby (key)
  {
    this.state.start('Lobby', true, false, this.lobbies.get(key));
  }

  createLobbyUI ()
  {
    this.lobbyUI = document.createElement('div');
    this.lobbyUI.id = 'lobby-ui';
    this.lobbyUI.style.left = `60px`;
    this.lobbyUI.style.top = `60px`;
    this.lobbyUI.style.width = `${config.gameWidth - 120}px`;
    this.lobbyUI.style.height = `${config.gameHeight - 80}px`;

    this.lobbyUI.appendChild(this.createLobbiesBox());
    this.lobbyUI.appendChild(this.createLobbyForm());
    document.querySelector('#game').appendChild(this.lobbyUI);
  }

  createLobbyForm ()
  {
    let form = document.createElement('form');
    form.id = 'create-lobby-form';
    form.classList.add('lobby-form');

    form.appendChild(this._createLobbyFormHeader());
    form.appendChild(this._createLobbyFormNameField());
    form.appendChild(this._createLobbyFormSubmit());

    form.addEventListener('submit', (evt) => this.createLobby(evt));

    return form;
  }

  _createLobbyFormHeader ()
  {
    let header = document.createElement('h2');
    header.classList.add('header');
    header.innerHTML = 'Stwórz lobby';

    return header;
  }

  _createLobbyFormNameField ()
  {
    let nameField = document.createElement('input');
    nameField.setAttribute('type', 'text');
    nameField.id = 'lobby-name-field';
    nameField.setAttribute('placeholder', 'Nazwa dla twojego lobby');
    nameField.setAttribute('maxlength', '32');
    nameField.classList.add('lobby-name-field');

    return nameField;
  }

  _createLobbyFormSubmit ()
  {
    let submit = document.createElement('button');
    submit.innerHTML = 'Stwórz';

    return submit;
  }

  createErrorField (text)
  {
    if (document.querySelector('#create-lobby-form #error-field'))
    {
      document.querySelector('#create-lobby-form #error-field').innerHTML = text;
      return;
    }

    let errorField = document.createElement('p');
    errorField.id = 'error-field';
    errorField.classList.add('error-field');
    errorField.innerHTML = text;

    document.querySelector('#create-lobby-form').appendChild(errorField);
  }

  createLobbiesBox ()
  {
    let lobbiesBox = document.createElement('div');
    lobbiesBox.classList.add('lobbies-box');

    let lobbiesHeader = document.createElement('h2');
    lobbiesHeader.classList.add('header');
    lobbiesHeader.innerHTML = 'Dołącz do rozgrywki';

    lobbiesBox.appendChild(lobbiesHeader);
    lobbiesBox.appendChild(this.createLobbiesList());

    return lobbiesBox;
  }

  createLobbiesList ()
  {
    let lobbiesList = document.createElement('ul');
    lobbiesList.classList.add('lobbies');

    this.lobbies.on('create', (lobby) =>
    {
      if (!lobby.name) return;

      lobbiesList.appendChild(this._createLobbyElement(lobby));
    });

    this.lobbies.on('remove', (lobby) =>
    {
      let lobbyElement = lobbiesList.querySelector(`#lobby-${lobby.key}`);
      if (lobbyElement) lobbiesList.removeChild(lobbyElement);
    });

    return lobbiesList;
  }

  _createLobbyElement (lobby)
  {
    let lobbyElement = document.createElement('li');
    lobbyElement.id = `lobby-${lobby.key}`;
    lobbyElement.classList.add('lobbies__item', 'lobby-item');

    lobbyElement.appendChild(this._createLobbyName(lobby.name));
    lobbyElement.appendChild(this._createLobbyPlayers(lobby.players, lobby.owner));

    lobbyElement.addEventListener('click', () =>
    {
      this.joinLobby(lobby.key);
    });

    lobby.on('change', (data) =>
    {
      let lobbyName = lobbyElement.querySelector('.lobby-item__name');
      lobbyName.innerHTML = escapeSpecialChars(data.name);

      let lobbyPlayers = lobbyElement.querySelector('.lobby-item__players');
      while (lobbyPlayers.hasChildNodes()) lobbyPlayers.removeChild(lobbyPlayers.lastChild);

      let lobbyPlayersItems = this._createLobbyPlayersItems(data.players, data.owner);
      lobbyPlayersItems.forEach((item) => lobbyPlayers.appendChild(item));
    });

    return lobbyElement;
  }

  _createLobbyName (name)
  {
    if (typeof name !== 'string') throw new TypeError('name must be a non-empty string');

    let lobbyName = document.createElement('h3');
    lobbyName.classList.add('lobby-item__name');
    lobbyName.innerHTML = escapeSpecialChars(name);

    return lobbyName;
  }

  _createLobbyPlayers (players, owner)
  {
    if (typeof players !== 'object') throw new TypeError('players must be an object');

    let lobbyPlayers = document.createElement('ul');
    lobbyPlayers.classList.add('lobby-item__players');

    let playersItems = this._createLobbyPlayersItems(players, owner);
    playersItems.forEach((item) => lobbyPlayers.appendChild(item));

    return lobbyPlayers;
  }

  _createLobbyPlayersItems (players, owner)
  {
    let playersList = new Set();

    for (let key in players)
    {
      let player = document.createElement('li');
      player.innerHTML = escapeSpecialChars(players[key].name);
      player.classList.add('lobby-item__player');
      if (key === owner) player.classList.add('lobby-item__player--owner');

      playersList.add(player);
    }

    return playersList;
  }

  createLobby (evt)
  {
    evt.preventDefault();

    let lobbyName = document.querySelector('#lobby-name-field').value;
    if (lobbyName.length === 0)
    {
      this.createErrorField('Wprowadź nazwę dla niesamowitego lobby!');
      return false;
    }
    else if (lobbyName.length < 3 || lobbyName.length > 32)
    {
      this.createErrorField('Niesamowite lobby ma od 3-32 znaków. Trzymaj się zasad niesamowitości!');
      return false;
    }

    let lobby = this.lobbies.createLobby(lobbyName, this.game.currentUser);
    this.joinLobby(lobby.key);
  }
}
