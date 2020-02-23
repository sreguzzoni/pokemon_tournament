require('../css/team.scss');

// API for pokeapi.co
const Pokedex = require('pokeapi-js-wrapper');
const POKEDEX = new Pokedex.Pokedex();

// useful const
const FIRST_POKEMON = 1;
const LAST_POKEMON = 807;
const MAX_POKEMON = 6;

// var used to count pokemon in team
var local_pokemon = 0;

/**
* Add a Pokemon to the selected team-id list.
* @param team The selected team id
* @param pokemon The inserted pokemon JSON object
*/
const addPokemonInList = (team, pokemon) => {
console.log("Adding");
    // set useful vars avoid multiple repicking
    let pokemonList = $('#team-' + team + ' .pokemon-list'), // the list of pokemon DOM objects in the team
        emptyData = $(pokemonList).find('.pokemon-list-empty'), // the empty data DOM object
        newPokemon = $('.pokemon-list--single.tpl').clone(), // clone the tpl and create a new DOM object
        newPokemonRemoveBtn = newPokemon.find('.pokemon-remove-btn'); // the new remove button
    // set useful attribute
    newPokemon.attr('id', 'pokemon-' + pokemon['id']);
    newPokemon.attr('pokemon-team', team);
    newPokemon.attr('pokemon-number', pokemon['number']);
    // set innert text
    newPokemon.find('.name h5').text(pokemon['name']);
    newPokemon.find('.exp p').text(pokemon['exp']);
    // set img
    newPokemon.find('.img-wrapper img').attr('src', pokemon['img']);
    newPokemon.find('.img-wrapper img').attr('alt', pokemon['name']);
    // set abilities
    pokemon['abilities'].forEach(ability => $('<span class="ability"></span>').text(ability['ability']['name']).appendTo(newPokemon.find('.abilities')));
    // set types
    let typeN = 1;
    pokemon['types'].forEach(type => $('<span class="type"></span>').text(type['type']['name']).appendTo(newPokemon.find('.types')));
    // work on delete button
    newPokemonRemoveBtn.attr('data-pokemon', pokemon['id']);
    // remove tpl class
    newPokemon.removeClass('tpl');
    // hide empty element if this is the first Pokemon
    if(!emptyData.hasClass('hidden')) {
        emptyData.addClass('hidden');
    }
    // append the new pokemon to the list
    newPokemon.appendTo(pokemonList);
    // bind the function on remove btn
    removePokemonBind();
}

/**
* Add a Pokemon to the selected team calling an AJAX service. Show a message if an error occured.
* @param path The path to AJAX service
* @param team The selected team id
*/
const addPokemon = (path, team) => {
	$.ajax({
        url: path,
        type: 'POST',
        dataType: 'json',
        data: {
            teamId: team
        },
        async: true,
        success: function (data)
        {
            // console.log('addPokemon function:' + data);
            addPokemonInList(team, data);
        },
        error: function (data)
        {
        	// console.log('addPokemon function:' + data);
            alert('Can\'t add a pokemon');
        }
    });
}

/**
* Remove the selected pokemon-id Pokemon from the list.
* @param pokemon The inserted Pokemon JSON object containing only the id
*/
const removePokemonInList = (pokemon) => {
    let pokemonListElement = $('#pokemon-' + pokemon['id']), // the pokemon list element that has to be removed
        team = pokemonListElement.attr('pokemon-team'), // the team id
        pokemonList = $('#team-' + team + ' .pokemon-list'), // the list of pokemon DOM objects in the team
        emptyData = $(pokemonList).find('.pokemon-list-empty'); // the empty data DOM object
    pokemonListElement.remove();
    // show empty element if there aren't Pokemon anymore
    if(pokemonList.children('.pokemon-list--single:not(.tpl)').length == 0) {
        emptyData.removeClass('hidden');
    }
}


/**
* Count local pokemon saved in the document and updated the related global counter.
*/
const countPokemonInTeam = () => {
    local_pokemon = $('.pokemon-list--single:not(.tpl)').length;
}

/**
* Remove the selected Pokemon calling an AJAX service. Show a message if an error occured.
* @param path The path to AJAX service
* @param pokemon The selected Pokemon id
*/
const removePokemon = (path, pokemon) => {
    $.ajax({
        url: path,
        type: 'POST',
        dataType: 'json',
        data: {
            pokemonId: pokemon
        },
        async: true,
        success: function (data)
        {
            // console.log('removePokemon function:' + data)
            removePokemonInList(data);
        },
        error: function (data)
        {
            // console.log('removePokemon function:' + data);
            alert('Can\'t remove the pokemon');
        }
    });
}

/**
* Binds all the .pokemon-add-btn buttons
*/
const addPokemonBind = () => {
	let buttons = $('.pokemon-add-btn');
	$(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let team = $(this).data('team');
        if(path !== 'local') {
            addPokemon(path, team);
        } else {
            // if the pokemon cannot be saved on db
            if(local_pokemon < MAX_POKEMON) {
                local_pokemon++;
                let number = Math.floor(Math.random() * LAST_POKEMON) + FIRST_POKEMON;
                getPokemon(number, team);
            } else {
                alert('You can\'t add a pokemon anymore!');
            }
        }
	});
}

/**
* Binds all the .pokemon-remove-btn buttons
*/
const removePokemonBind = () => {
    let buttons = $('.pokemon-remove-btn');
    $(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let pokemon = $(this).data('pokemon');
        console.log(pokemon);
        if(path !== 'local') {
            removePokemon(path, pokemon);
        } else {
            // if the pokemon is not saved on db
            removePokemonInList({'id': pokemon});
            local_pokemon--;
            updateLocalPokemonInput();
        }
    });
}

/*
* Retrieve informations about a single Pokemon from the id.
* @param pokemonNumber The selected Pokemon id
*/
const getPokemon = (pokemonNumber, team = 0) => {
    POKEDEX.getPokemonByName(pokemonNumber)
        .then(function(response) {
            // create JSON object
            let pokemonJSON = {
                'id' : local_pokemon,
                'number': pokemonNumber,
                'name': response['name'],
                'exp': response['base_experience'],
                'img': response['sprites']['front_default'],
                'abilities': response['abilities'],
                'types': response['types']
            };
            addPokemonInList(team, pokemonJSON);
            updateLocalPokemonInput();
    });
}

/*
* Update the hidden input pokemon number.
*/
const updateLocalPokemonInput = () => {
    let pokemon_local_numbers = new Array();
    $('.pokemon-list--single:not(.tpl)').each(function() {
        // for each pokemon, push its number
        pokemon_local_numbers.push($(this).attr('pokemon-number'));
    });
    $('#team_pokemon').val(pokemon_local_numbers);
}

/*
* Insert the select type options and bind it to make it works.
*/
const searchTypeBind = () => {
    let select = $('#type-select');
    let types_opts = new Array();
    // let's find all the types
    $('.team-list--list--item').each(function(){
        // for each team
        let that = $(this);
        that.find('.pokemon-list').children('.pokemon-list--single').each(function(){
            // for each pokemon in team
            $(this).find('.types').children('.type').each(function(){
                // for each type
                that.addClass($(this).text());
                if(types_opts.indexOf($(this).text()) == -1) {
                    // if new type, push it in the array
                    types_opts.push($(this).text());
                    select.append($('<option>', {
                        value: $(this).text(),
                        text: $(this).text()
                    }));
                }
            });
        });
    });
    // let's bind the select
    select.on('change', function(){
        let filter = $(this).val();
        if(filter != 'all') {
            $('.team-list--list--item').hide();
            $('.' + filter).show();
        } else {
            $('.team-list--list--item').show();
        }
    });
}

/**************** ENTRY POINT *******************/
$(document).ready(function() {
    // bind buttons
	addPokemonBind();
    removePokemonBind();
    // update local pokemon number for edit form
    countPokemonInTeam();
    updateLocalPokemonInput();
    // bind select
    searchTypeBind();
});
