const response = await axios.get(
    `https://pokeapi.co/api/v2/move/${id}`
);

if (response.data.id === 33) {

    console.log(

        JSON.stringify(

            {
                power: response.data.power,
                accuracy: response.data.accuracy,
                pp: response.data.pp,
                past_values: response.data.past_values
            },

            null,

            4

        )

    );

}