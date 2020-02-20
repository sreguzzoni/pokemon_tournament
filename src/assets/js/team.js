require('../css/team.less');

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
            console.log('addPokemon function:' + data)
        },
        error: function (data)
        {
        	console.log('addPokemon function:' + data);
        }
    });
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
            console.log('removePokemon function:' + data)
        },
        error: function (data)
        {
            console.log('removePokemon function:' + data);
        }
    });
}

const addPokemonBind = () => {
	let buttons = $('.ajax');
	$(buttons).on('click', function() {
        let path = $(this).data('path');
        let team = $(this).data('team');
		addPokemon(path, team);
	});
}

const removePokemonBind = () => {
    let buttons = $('.pokemon-remove-btn');
    $(buttons).on('click', function() {
        let path = $(this).data('path');
        let pokemon = $(this).data('pokemon');
        removePokemon(path, pokemon);
    });
}

$(document).ready(function() {
	addPokemonBind();
    removePokemonBind();
});