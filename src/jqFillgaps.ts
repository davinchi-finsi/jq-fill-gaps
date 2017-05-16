/**
 * @class fillgaps
 */
$.widget("hz.fillgaps", {
    /**
     * @memberof fillgaps
     */
    NAMESPACE: "fillgaps",
    ON_FILLGAPS_START: "fillgaps:start",
    ON_FILLGAPS_OVER: 'fillgaps:over',
    ON_FILLGAPS_COMPLETED: 'fillgaps:completed',
    ON_FILLGAPS_OK: 'fillgaps_ok',
    CLASS_GAPS: 'hz-fill-gaps-gap',
    CLASS_GAPS_OK: '.hz-gap-evaluate-ko',

    // Default options.
    options: {
        immediate_feedback: true,
        classes: {
            'hz-fill-gaps': 'hz-fill-gaps-default',
            'hz-fill-gaps-gap': 'hz-fill-gaps-gap'
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
        let _gaps = this.element.find('.hz-fill-gaps-gap')

        // Guardamos el número total de gaps
        this._numberGaps = $('.hz-fill-gaps-gap').length;

        // Si no existe ningún gap lanzamos un error
        if (this._numberGaps == 0) {
            console.error('No se ha encontrado ningún gap. Necesitas usar la clase hz-fill-gaps-gap');
        } else {

            for (let i = 0; i < _gaps.length; i++) {
                //Guardamos las palabras y el hueco que le corresponde
                this._gaps.push({'idGap': i, 'word': _gaps[i].innerText});

                // Reemplazamos las palabras dejando el hueco para colocarla y añadimos
                // una interrogación para que el usuario pueda colocarla
                // añadimos las clases
                $(_gaps[i])
                    .addClass('ui-droppable hz-fill-gaps-gap_destiny');
                // añadimos el id
                $(_gaps[i])
                    .attr('data-hz-fill-gaps-gap_destiny', i);
                // añadimos la longitud de la palabra por si queremos hacer el ancho del hueco en función de la misma
                $(_gaps[i])
                    .attr('data-hz-fill-gaps-gap_lenght', _gaps[i].innerText.length);
                // pintamos dentro la interrogación
                $(_gaps[i])
                    .html('<span class="gap_empty">?</span>');
            }

            this._drawWords();
        }
    },

    /*
     * Pintamos las palabras disponibles para rellenar los huecos
     */
    _drawWords: function () {

        // creamos el contenedor donde irán ubicadas las palabras
        let html = '<div class="hz-fill-gaps-gaps_origin">';

        let arrGaps = this._shuffleArray(this._gaps);
        // recorremos las palabras que tenemos almacenadas
        for (let i = 0; i < arrGaps.length; i++) {
            html += `<div class="hz-fill-gaps-gap_origin ui-draggable" data-hz-fill-gaps-gap_origin="${arrGaps[i].idGap}">${arrGaps[i].word}</div>`;
        }
        html += '</div>';

        // las añadimos al elemento principal
        this.element.prepend(html);
        this._createEvents();
    },

    _createEvents: function () {
        let that = this;

        // habilitamos que las palabras se puedan mover
        $('.hz-fill-gaps-gap_origin')
            .draggable(
                {
                    revert: "valid",
                    containment: "#actividad"
                });


        // habilitamos que los huecos puedan recibir palabras
        $('.hz-fill-gaps-gap_destiny')
            .droppable({
                           hoverClass: "hover_destiny",
                           drop: function (event, ui) {
                               that._handleDrop(event, ui, this);
                           }
                       });

    },


    _handleDrop: function (event, ui, _this) {

        let that = this;
        let origin = ui.helper
        let destiny = $(_this)

        let word = origin.html();
        let idOrigin = origin.attr('data-hz-fill-gaps-gap_origin');
        let idDestiny = destiny.attr('data-hz-fill-gaps-gap_destiny');

        // comprobamos si ha acertado
        let evaluate = 'ko';

        // Evaluamos si el id de la palabra origen corresponde con la del hueco
        // o si la palabra que queremos ubicar se corresponde con la del hueco.
        // De esta manera se pueden colocar en un mismo hueco palabras que son idénticas.
        // Si en dos huecos está la misma palabra, podemos intercambiarlas y ponerlas en
        // cualquiera de los dos huecos
        if (idOrigin == idDestiny || word == that._getWord(idDestiny)) {
            evaluate = 'ok';
        }

        // colocamos la palabra en el hueco
        destiny.html(`<span class="hz-gap-filled hz-gap-evaluate-${evaluate}">${word}</span>`);
        // elimniamos la palabra del origen
        origin.remove();

        // si la palabra es errónea, se le da opción a que la vuelva a recolocar
        if (evaluate == 'ko') {
            that._handleGapFilled(idOrigin);
        }

        // evaluamos si se ha terminado el ejercicio
        that._numberGapsFilled = $('.hz-gap-filled').length;
        that._numberGapsOK = $('.hz-gap-evaluate-ok').length;


        if (that._numberGapsFilled == that._numberGaps) {
            that._trigger(this.ON_FILLGAPS_COMPLETED);
        }
        if (that._numberGapsOK == that._numberGaps) {
            that._trigger(this.ON_FILLGAPS_OK);
            that.element.find('.hz-fill-gaps-gaps_origin')
                .remove();
        }
    },

    _handleGapFilled: function (origin) {
        var that = this;

        //Recogemos
        let _gaps_ko = this.element.find(this.CLASS_GAPS_OK);
        let word = '';

        _gaps_ko.on('click', function () {
            word = $(this)
                .html();
            $(this)
                .removeClass('hz-gap-filled hz-gap-evaluate-ko');
            $(this)
                .addClass('gap_empty')
                .html('?');

            //Añadimos el gap inicial para poder volver a generarlo
            if (word != '?') {
                let _gaps_origin = that.element.find('.hz-fill-gaps-gaps_origin');
                let _gap = `<div class="hz-fill-gaps-gap_origin ui-draggable" data-hz-fill-gaps-gap_origin="${origin}">${word}</div>`;
                $(_gaps_origin)
                    .append(_gap);
                that._createEvents();
            }
        });

    },

    /*
     * Obtiene la palabra que corresponde al hueco de destino seleccionado
     */
    _getWord: function (idDestiny) {
        var gaps = this._gaps;
        for (let i = 0; i < gaps.length; i++) {
            if (idDestiny == gaps[i].idGap) {
                return gaps[i].word;
            }
        }
    },

    /*
     *  Devuelve un orden aleatorio del array que se le pasa
     *  @params array
     */
    _shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

});