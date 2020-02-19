// require('../css/team.less');

const addPokemon = (path, team) => {
	$.ajax({
        url: path,
        type: 'POST',
        dataType: 'json',
        data: {
            team: team
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

const addPokemonBind = () => {
	let button = $('button.ajax');
	let path = $(button).data('path');
	let team = $(button).data('team');
	$(document).on('click', button, function() {
		addPokemon(path, team);
	});
}

$(document).ready(function() {
	addPokemonBind();
});