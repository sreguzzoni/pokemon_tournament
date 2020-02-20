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

const addPokemonBind = () => {
	let buttons = $('.ajax');
	$(buttons).on('click', function() {
        let path = $(this).data('path');
        let team = $(this).data('team');
		addPokemon(path, team);
	});
}

$(document).ready(function() {
	addPokemonBind();
});