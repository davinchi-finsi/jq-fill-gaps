/**
* @class fillgaps
*/
$.widget("hz.fillgaps", {
    /**
    * @memberof fillgaps
    */
    NAMESPACE: "fillgaps",
    ON_fillgaps_START: "fillgapsstart",
    ON_fillgaps_OVER: 'fillgapsover',



    // Default options.
    options: {
        data_json: '',
        classes: {
            'hz-fill-gaps': 'hz-fill-gaps-default'
        }

    },
    /**
    * @memberof fillgaps
    * Función de creación del widget
    * @function
    */
    _create: function () {
        console.log('create');
        //Var declaration globales
        this._conversations;

        this._getDataJson();
    },

    /**
    * Inicia el componente
    */
    _init: function () {

    },

    _getDataJson: function () {
        let that = this;
        let url = this.options.data_json;

        $.getJSON(url, function (data) {
            that._conversations = data.conversations;
            that._drawChat();
        });

    }



});
