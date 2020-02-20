require('../css/team.less');

const addPokemonInList = (team, pokemon) => {
    let pokemonList = $('#team-' + team + ' .pokemon-list');
    let emptyData = $(pokemonList).find('.pokemon-list-empty');
    let newPokemon = $('.pokemon-list-element.tpl').clone();
    let newPokemonRemoveBtn = newPokemon.find('.pokemon-remove-btn');
    newPokemon.attr('id', 'pokemon-' + pokemon['id']);
    newPokemon.attr('pokemon-team', team);
    newPokemon.find('.name').text(pokemon['name']);
    newPokemon.find('.exp').text(pokemon['exp']);
    newPokemon.find('.img').text(pokemon['img']);
    newPokemon.find('.abilities').text(pokemon['abilities']);
    newPokemon.find('.types').text(pokemon['types']);
    // work on delete button
    newPokemonRemoveBtn.attr('data-pokemon', pokemon['id']);
    // remove tpl class
    newPokemon.removeClass('tpl');
    // delete old td if it's first pokemon of the team
    if(!emptyData.hasClass('hidden')) {
        emptyData.addClass('hidden');
    }
    // append the new pokemon to the list
    $('<td></td>').html(newPokemon).appendTo(pokemonList);
    // bind the function on remove btn
    removePokemonBind();
}

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
            alert("Can't add a pokemon");
        }
    });
}

const removePokemonInList = (pokemon) => {
    let pokemonListElement = $('#pokemon-' + pokemon['id']);
    let team = pokemonListElement.attr('pokemon-team');
    let pokemonList = $('#team-' + team + ' .pokemon-list');
    let emptyData = $(pokemonList).find('.pokemon-list-empty');
    pokemonListElement.parent().remove();
    if(pokemonList.children('td').length <= 1) {
        emptyData.removeClass('hidden');
    }
}

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
            alert("Can't add a pokemon");
        }
    });
}

const addPokemonBind = () => {
	let buttons = $('.ajax');
	$(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let team = $(this).data('team');
		addPokemon(path, team);
	});
}

const removePokemonBind = () => {
    let buttons = $('.pokemon-remove-btn');
    $(buttons).off('click').on('click', function() {
        let path = $(this).data('path');
        let pokemon = $(this).data('pokemon');
        removePokemon(path, pokemon);
    });
}

$(document).ready(function() {
	addPokemonBind();
    removePokemonBind();
});