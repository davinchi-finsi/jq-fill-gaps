/**
 * @class fillgaps
 */
$.widget("hz.fillgaps", {
    /**
     * @memberof fillgaps
     */
    NAMESPACE: "fillgaps",
    GAP_STATE:{
        KO:0,
        OK:1
    },
    ON_FILLGAPS_START: "fillgaps:start",
    ON_FILLGAPS_OVER: 'fillgaps:over',
    ON_FILLGAPS_COMPLETED: 'fillgaps:completed',
    ON_FILLGAPS_OK: 'fillgaps:ok',
    CLASS_GAPS: 'hz-fillgaps__gap',
    CLASS_GAP_WORDS:'hz-fillgaps__words',
    CLASS_GAP_WORD:'hz-fillgaps__word',
    CLASS_GAP_DESTINY: 'hz-fillgaps__gap--destiny',
    CLASS_GAP_EMPTY: 'hz-fillgaps__gap--empty',
    CLASS_GAP_ORIGIN: 'hz-fill-gaps-gaps_origin',
    CLASS_GAP_HOVER_DESTINY:'hover_destiny',
    CLASS_GAP_FILLED:'hz-fillgaps__gap--filled',
    CLASS_GAP_STATE_OK:'hz-fillgaps__gap--ok',
    CLASS_GAP_STATE_KO:'hz-fillgaps__gap--ko',
    QUERY_GAP: '.hz-fillgaps__gap',
    QUERY_GAP_ORIGIN: '.hz-fill-gaps-gap_origin',
    QUERY_GAP_DESTINY: '.hz-fillgaps__gap--destiny',
    QUERY_GAP_WORD:'.hz-fillgaps__word',
    QUERY_GAP_WORDS:'.hz-fillgaps__words',
    QUERY_GAP_FILLED:'.hz-fillgaps__gap--filled',
    QUERY_GAP_STATE_OK:'.hz-fillgaps__gap--ok',
    ATTR_GAP_WORD:'data-hz-fillgaps-word',
    ATTR_GAP_DESTINY:'data-hz-fillgaps-gap-destiny',
    ATTR_GAP_LENGTH: 'data-hz-fillgaps-gap-lenght',
    // Default options.
    options: {
        immediate_feedback: true,
        classes: {
            'hz-fillgaps': 'hz-fillgaps--default',
            'hz-fillgaps__gap':'hz-fillgaps__gap'
        }
    },

    /**
     * @memberof fillgaps
     * Función de creación del widget
     * @function
     */
    _create: function () {

        //Var declaration globales
        this._gaps = [];
        this._numberGaps;
        this._numberGapsFilled = 0;

        //
        this._buildHtml();

    },

    /**
     * Inicia el componente
     */
    _init: function () {

    },

    _buildHtml: function () {

        // obtenemos todos los gaps que hay
        let _gaps = this.element.find(this.QUERY_GAP);

        // Guardamos el número total de gaps
        this._numberGaps = _gaps.length;

        // Si no existe ningún gap lanzamos un error
        if (this._numberGaps == 0) {
            throw 'No se ha encontrado ningún gap. Necesitas usar la clase ' + this.QUERY_GAP;
        } else {
            for (let gapIndex = 0; gapIndex < _gaps.length; gapIndex++) {
                let currentGap = $(_gaps[gapIndex]),
                    gapText = currentGap.text();
                //Guardamos las palabras y el hueco que le corresponde

                // Reemplazamos las palabras dejando el hueco para colocarla y añadimos
                // una interrogación para que el usuario pueda colocarla
                // añadimos las clases
                currentGap
                    .addClass('ui-droppable ' + this.CLASS_GAP_DESTINY)
                    // añadimos el id
                    .attr(this.ATTR_GAP_DESTINY, gapIndex)
                    // añadimos la longitud de la palabra por si queremos hacer el ancho del hueco en función de la misma
                    .attr(this.ATTR_GAP_LENGTH, currentGap.text().length)
                    // pintamos dentro la interrogación
                    .html(`<span class="${this.CLASS_GAP_EMPTY}">?</span>`);
                let newGap = {
                    'idGap': gapIndex,
                    'word': gapText,
                    '$gap':currentGap
                };
                this._gaps.push(newGap);
            }

            this._drawWords();
        }
    },

    /*
     * Pintamos las palabras disponibles para rellenar los huecos
     */
    _drawWords: function () {

        // creamos el contenedor donde irán ubicadas las palabras
        let html = $('<div class="' + this.CLASS_GAP_WORDS + '"></div>');

        let arrGaps = this._shuffleArray(this._gaps);
        // recorremos las palabras que tenemos almacenadas
        for (let gapIndex = 0; gapIndex < arrGaps.length; gapIndex++) {
            let currentGap = arrGaps[gapIndex];
            let $word = $(`<div class="${this.CLASS_GAP_WORD} ui-draggable" ${this.ATTR_GAP_WORD}="${currentGap.idGap}">${currentGap.word}</div>`);
            $word.data("gapId",currentGap.idGap);
            currentGap.$word = $word;
            html.append($word);
        }

        // las añadimos al elemento principal
        this.element.prepend(html);
        this._createEvents();
    },

    _createEvents: function () {
        let that = this;
        //listener click en palabras fallidas
        this.element.off('click.'+this.NAMESPACE).on('click.'+this.NAMESPACE, this.QUERY_GAP_KO,{instance:this},this._onKoGapClick);
        // habilitamos que las palabras se puedan mover
        this.element.find(this.QUERY_GAP_WORD)
            .draggable(
                {
                    revert: "valid",
                    containment: "#actividad"
                }
            );


        // habilitamos que los huecos puedan recibir palabras
        this.element.find(this.QUERY_GAP_DESTINY)
            .droppable({
               hoverClass: this.CLASS_GAP_HOVER_DESTINY,
               drop: function (event, ui) {
                    that._handleDrop(event, ui, this);
                }
           });

    },


    _handleDrop: function (event, ui, _this) {
        if(!this.isDisabled()) {
            let $word = ui.helper;
            let $gap = $(_this);
            let wordGapId = $word.data("gapId");
            let idDestiny = $gap.attr(this.ATTR_GAP_DESTINY);
            let wordGap = this._getGapById(wordGapId);
            let word = wordGap.word;
            // comprobamos si ha acertado
            let evaluate = this.GAP_STATE.KO;
            // Evaluamos si el id de la palabra origen corresponde con la del hueco
            // o si la palabra que queremos ubicar se corresponde con la del hueco.
            // De esta manera se pueden colocar en un mismo hueco palabras que son idénticas.
            // Si en dos huecos está la misma palabra, podemos intercambiarlas y ponerlas en
            // cualquiera de los dos huecos
            if (wordGapId == idDestiny) {
                evaluate = this.GAP_STATE.OK;
            }
            // colocamos la palabra en el hueco
            $gap.addClass(this.CLASS_GAP_FILLED).addClass(evaluate === this.GAP_STATE.OK ? this.CLASS_GAP_STATE_OK : this.CLASS_GAP_STATE_KO).text(word);
            $gap.data("currentWord", wordGapId);
            // elimniamos la palabra del origen
            wordGap.$word = $word.detach();
            // evaluamos si se ha terminado el ejercicio
            this._numberGapsFilled = this.element.find(this.QUERY_GAP_FILLED).length;
            this._numberGapsOK = this.element.find(this.QUERY_GAP_STATE_OK).length;


            if (this._numberGapsFilled == this._numberGaps) {
                this._trigger(this.ON_FILLGAPS_COMPLETED);
            }
            if (this._numberGapsOK == this._numberGaps) {
                this._trigger(this.ON_FILLGAPS_OK);
                this.element.find(this.QUERY_GAP_WORDS)
                    .remove();
            }
        }else{
            event.preventDefault();
        }
    },
    _onKoGapClick:function(e){
        let instance = e.data.instance,
            $gap = $(e.target),
            wordId = $gap.data("currentWord"),
            gap = instance._getGapById(wordId)
        $gap
            .removeClass(`${instance.CLASS_GAP_STATE_KO} ${instance.CLASS_GAP_FILLED}`)
            .addClass(instance.CLASS_GAP_EMPTY)
            .text('?');

        //Añadimos el gap inicial para poder volver a generarlo
        if (gap.word != '?') {
            let _gaps_origin = instance.element.find(instance.QUERY_GAP_WORDS);
            _gaps_origin.append(gap.$word);
        }
    },

    disable:function () {
        this._super();
        this.element.find(this.QUERY_GAP_WORD).draggable("disable");
        this.element.find(this.QUERY_GAP_DESTINY).droppable("disable");
    },

    enable:function () {
        this._super();
        this._words = this.element.find(this.QUERY_GAP_DESTINY);
        this.element.find(this.QUERY_GAP_WORD).draggable("enable");
        this.element.find(this.QUERY_GAP_DESTINY).droppable("enable");
    },

    /*
     * Obtiene la palabra que corresponde al hueco de destino seleccionado
     */
    _getGapById: function (id) {
        var gaps = this._gaps,
            result;
        for (let gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
            let currentGap = gaps[gapIndex];
            if (id == currentGap.idGap) {
                result = currentGap;
                gapIndex = gaps.length;
            }
        }
        return result;
    },

    /*
     *  Devuelve un orden aleatorio del array que se le pasa
     *  @params array
     */
    _shuffleArray: function (array) {
        for (var positionIndex = array.length - 1; positionIndex > 0; positionIndex--) {
            var j = Math.floor(Math.random() * (positionIndex + 1));
            var temp = array[positionIndex];
            array[positionIndex] = array[j];
            array[j] = temp;
        }
        return array;
    }

});