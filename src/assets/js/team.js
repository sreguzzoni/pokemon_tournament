require('../css/team.less');

/**
* Add a Pokemon to the selected team-id list.
* @param team The selected team id
* @param pokemon The inserted pokemon JSON object
*/
const addPokemonInList = (team, pokemon) => {
    // set useful vars avoid multiple repicking
    let pokemonList = $('#team-' + team + ' .pokemon-list'), // the list of pokemon DOM objects in the team
        emptyData = $(pokemonList).find('.pokemon-list-empty'), // the empty data DOM object
        newPokemon = $('.pokemon-list-element.tpl').clone(), // clone the tpl and create a new DOM object
        newPokemonRemoveBtn = newPokemon.find('.pokemon-remove-btn'); // the new remove button
    // set useful attribute
    newPokemon.attr('id', 'pokemon-' + pokemon['id']);
    newPokemon.attr('pokemon-team', team);
    // set innert text
    newPokemon.find('.name').text(pokemon['name']);
    newPokemon.find('.exp').text(pokemon['exp']);
    newPokemon.find('.img').text(pokemon['img']);
    newPokemon.find('.abilities').text(pokemon['abilities']);
    newPokemon.find('.types').text(pokemon['types']);
    // work on delete button
    newPokemonRemoveBtn.attr('data-pokemon', pokemon['id']);
    // remove tpl class
    newPokemon.removeClass('tpl');
    // hide empty element if this is the first Pokemon
    if(!emptyData.hasClass('hidden')) {
        emptyData.addClass('hidden');
    }
    // append the new pokemon to the list
    $('<td></td>').html(newPokemon).appendTo(pokemonList);
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
    pokemonListElement.parent().remove();
    // show empty element if there aren't Pokemon anymore
    if(pokemonList.children('td').length <= 1) {
        emptyData.removeClass('hidden');
    }
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
            alert('Can\'t add a pokemon');
        }
    });
}

/**
* Binds all the .pokemon-add-btn buttons with AJAX related service
*/
const addPokemonBind = () => {
	let buttons = $('.ajax');
	$(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let team = $(this).data('team');
		addPokemon(path, team);
	});
}

/**
* Binds all the .pokemon-remove-btn buttons with AJAX related service
*/
const removePokemonBind = () => {
    let buttons = $('.pokemon-remove-btn');
    $(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let pokemon = $(this).data('pokemon');
        removePokemon(path, pokemon);
    });
}

/**************** ENTRY POINT *******************/
$(document).ready(function() {
    // bind buttons
	addPokemonBind();
    removePokemonBind();
});