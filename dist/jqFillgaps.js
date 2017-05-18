/**
 * @class fillgaps
 */
$.widget("hz.fillgaps", {
    /**
     * @memberof fillgaps
     */
    NAMESPACE: "fillgaps",
    GAP_STATE: {
        KO: 0,
        OK: 1
    },
    ON_FILLGAPS_START: "fillgaps:start",
    ON_FILLGAPS_OVER: 'fillgaps:over',
    ON_FILLGAPS_COMPLETED: 'fillgaps:completed',
    ON_FILLGAPS_OK: 'fillgaps:ok',
    CLASS_GAPS: 'hz-fillgaps__gap',
    CLASS_GAP_WORDS: 'hz-fillgaps__words',
    CLASS_GAP_WORD: 'hz-fillgaps__word',
    CLASS_GAP_DESTINY: 'hz-fillgaps__gap--destiny',
    CLASS_GAP_EMPTY: 'hz-fillgaps__gap--empty',
    CLASS_GAP_ORIGIN: 'hz-fill-gaps-gaps_origin',
    CLASS_GAP_HOVER_DESTINY: 'hover_destiny',
    CLASS_GAP_FILLED: 'hz-fillgaps__gap--filled',
    CLASS_GAP_STATE_OK: 'hz-fillgaps__gap--ok',
    CLASS_GAP_STATE_KO: 'hz-fillgaps__gap--ko',
    QUERY_GAP: '.hz-fillgaps__gap',
    QUERY_GAP_ORIGIN: '.hz-fill-gaps-gap_origin',
    QUERY_GAP_DESTINY: '.hz-fillgaps__gap--destiny',
    QUERY_GAP_WORD: '.hz-fillgaps__word',
    QUERY_GAP_WORDS: '.hz-fillgaps__words',
    QUERY_GAP_FILLED: '.hz-fillgaps__gap--filled',
    QUERY_GAP_STATE_OK: '.hz-fillgaps__gap--ok',
    ATTR_GAP_WORD: 'data-hz-fillgaps-word',
    ATTR_GAP_DESTINY: 'data-hz-fillgaps-gap-destiny',
    ATTR_GAP_LENGTH: 'data-hz-fillgaps-gap-lenght',
    // Default options.
    options: {
        immediate_feedback: true,
        classes: {
            'hz-fillgaps': 'hz-fillgaps--default',
            'hz-fillgaps__gap': 'hz-fillgaps__gap'
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
        var _gaps = this.element.find(this.QUERY_GAP);
        // Guardamos el número total de gaps
        this._numberGaps = _gaps.length;
        // Si no existe ningún gap lanzamos un error
        if (this._numberGaps == 0) {
            throw 'No se ha encontrado ningún gap. Necesitas usar la clase ' + this.QUERY_GAP;
        }
        else {
            for (var gapIndex = 0; gapIndex < _gaps.length; gapIndex++) {
                var currentGap = $(_gaps[gapIndex]), gapText = currentGap.text();
                //Guardamos las palabras y el hueco que le corresponde
                // Reemplazamos las palabras dejando el hueco para colocarla y añadimos
                // una interrogación para que el usuario pueda colocarla
                // añadimos las clases
                currentGap
                    .addClass('ui-droppable ' + this.CLASS_GAP_DESTINY)
                    .attr(this.ATTR_GAP_DESTINY, gapIndex)
                    .attr(this.ATTR_GAP_LENGTH, currentGap.text().length)
                    .html("<span class=\"" + this.CLASS_GAP_EMPTY + "\">?</span>");
                var newGap = {
                    'idGap': gapIndex,
                    'word': gapText,
                    '$gap': currentGap
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
        var html = $('<div class="' + this.CLASS_GAP_WORDS + '"></div>');
        var arrGaps = this._shuffleArray(this._gaps);
        // recorremos las palabras que tenemos almacenadas
        for (var gapIndex = 0; gapIndex < arrGaps.length; gapIndex++) {
            var currentGap = arrGaps[gapIndex];
            var $word = $("<div class=\"" + this.CLASS_GAP_WORD + " ui-draggable\" " + this.ATTR_GAP_WORD + "=\"" + currentGap.idGap + "\">" + currentGap.word + "</div>");
            $word.data("gapId", currentGap.idGap);
            currentGap.$word = $word;
            html.append($word);
        }
        // las añadimos al elemento principal
        this.element.prepend(html);
        this._createEvents();
    },
    _createEvents: function () {
        var that = this;
        //listener click en palabras fallidas
        this.element.off('click.' + this.NAMESPACE).on('click.' + this.NAMESPACE, this.QUERY_GAP_KO, { instance: this }, this._onKoGapClick);
        // habilitamos que las palabras se puedan mover
        this.element.find(this.QUERY_GAP_WORD)
            .draggable({
            revert: "valid",
            containment: "#actividad"
        });
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
        if (!this.isDisabled()) {
            var $word = ui.helper;
            var $gap = $(_this);
            var wordGapId = $word.data("gapId");
            var idDestiny = $gap.attr(this.ATTR_GAP_DESTINY);
            var wordGap = this._getGapById(wordGapId);
            var word = wordGap.word;
            // comprobamos si ha acertado
            var evaluate = this.GAP_STATE.KO;
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
        }
        else {
            event.preventDefault();
        }
    },
    _onKoGapClick: function (e) {
        var instance = e.data.instance, $gap = $(e.target), wordId = $gap.data("currentWord"), gap = instance._getGapById(wordId);
        $gap
            .removeClass(instance.CLASS_GAP_STATE_KO + " " + instance.CLASS_GAP_FILLED)
            .addClass(instance.CLASS_GAP_EMPTY)
            .text('?');
        //Añadimos el gap inicial para poder volver a generarlo
        if (gap.word != '?') {
            var _gaps_origin = instance.element.find(instance.QUERY_GAP_WORDS);
            _gaps_origin.append(gap.$word);
        }
    },
    disable: function () {
        this._super();
        this.element.find(this.QUERY_GAP_WORD).draggable("disable");
        this.element.find(this.QUERY_GAP_DESTINY).droppable("disable");
    },
    enable: function () {
        this._super();
        this._words = this.element.find(this.QUERY_GAP_DESTINY);
        this.element.find(this.QUERY_GAP_WORD).draggable("enable");
        this.element.find(this.QUERY_GAP_DESTINY).droppable("enable");
    },
    /*
     * Obtiene la palabra que corresponde al hueco de destino seleccionado
     */
    _getGapById: function (id) {
        var gaps = this._gaps, result;
        for (var gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
            var currentGap = gaps[gapIndex];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcUZpbGxnYXBzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzIGZpbGxnYXBzXG4gKi9cbiQud2lkZ2V0KFwiaHouZmlsbGdhcHNcIiwge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBmaWxsZ2Fwc1xuICAgICAqL1xuICAgIE5BTUVTUEFDRTogXCJmaWxsZ2Fwc1wiLFxuICAgIEdBUF9TVEFURToge1xuICAgICAgICBLTzogMCxcbiAgICAgICAgT0s6IDFcbiAgICB9LFxuICAgIE9OX0ZJTExHQVBTX1NUQVJUOiBcImZpbGxnYXBzOnN0YXJ0XCIsXG4gICAgT05fRklMTEdBUFNfT1ZFUjogJ2ZpbGxnYXBzOm92ZXInLFxuICAgIE9OX0ZJTExHQVBTX0NPTVBMRVRFRDogJ2ZpbGxnYXBzOmNvbXBsZXRlZCcsXG4gICAgT05fRklMTEdBUFNfT0s6ICdmaWxsZ2FwczpvaycsXG4gICAgQ0xBU1NfR0FQUzogJ2h6LWZpbGxnYXBzX19nYXAnLFxuICAgIENMQVNTX0dBUF9XT1JEUzogJ2h6LWZpbGxnYXBzX193b3JkcycsXG4gICAgQ0xBU1NfR0FQX1dPUkQ6ICdoei1maWxsZ2Fwc19fd29yZCcsXG4gICAgQ0xBU1NfR0FQX0RFU1RJTlk6ICdoei1maWxsZ2Fwc19fZ2FwLS1kZXN0aW55JyxcbiAgICBDTEFTU19HQVBfRU1QVFk6ICdoei1maWxsZ2Fwc19fZ2FwLS1lbXB0eScsXG4gICAgQ0xBU1NfR0FQX09SSUdJTjogJ2h6LWZpbGwtZ2Fwcy1nYXBzX29yaWdpbicsXG4gICAgQ0xBU1NfR0FQX0hPVkVSX0RFU1RJTlk6ICdob3Zlcl9kZXN0aW55JyxcbiAgICBDTEFTU19HQVBfRklMTEVEOiAnaHotZmlsbGdhcHNfX2dhcC0tZmlsbGVkJyxcbiAgICBDTEFTU19HQVBfU1RBVEVfT0s6ICdoei1maWxsZ2Fwc19fZ2FwLS1vaycsXG4gICAgQ0xBU1NfR0FQX1NUQVRFX0tPOiAnaHotZmlsbGdhcHNfX2dhcC0ta28nLFxuICAgIFFVRVJZX0dBUDogJy5oei1maWxsZ2Fwc19fZ2FwJyxcbiAgICBRVUVSWV9HQVBfT1JJR0lOOiAnLmh6LWZpbGwtZ2Fwcy1nYXBfb3JpZ2luJyxcbiAgICBRVUVSWV9HQVBfREVTVElOWTogJy5oei1maWxsZ2Fwc19fZ2FwLS1kZXN0aW55JyxcbiAgICBRVUVSWV9HQVBfV09SRDogJy5oei1maWxsZ2Fwc19fd29yZCcsXG4gICAgUVVFUllfR0FQX1dPUkRTOiAnLmh6LWZpbGxnYXBzX193b3JkcycsXG4gICAgUVVFUllfR0FQX0ZJTExFRDogJy5oei1maWxsZ2Fwc19fZ2FwLS1maWxsZWQnLFxuICAgIFFVRVJZX0dBUF9TVEFURV9PSzogJy5oei1maWxsZ2Fwc19fZ2FwLS1vaycsXG4gICAgQVRUUl9HQVBfV09SRDogJ2RhdGEtaHotZmlsbGdhcHMtd29yZCcsXG4gICAgQVRUUl9HQVBfREVTVElOWTogJ2RhdGEtaHotZmlsbGdhcHMtZ2FwLWRlc3RpbnknLFxuICAgIEFUVFJfR0FQX0xFTkdUSDogJ2RhdGEtaHotZmlsbGdhcHMtZ2FwLWxlbmdodCcsXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zLlxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgaW1tZWRpYXRlX2ZlZWRiYWNrOiB0cnVlLFxuICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgICAnaHotZmlsbGdhcHMnOiAnaHotZmlsbGdhcHMtLWRlZmF1bHQnLFxuICAgICAgICAgICAgJ2h6LWZpbGxnYXBzX19nYXAnOiAnaHotZmlsbGdhcHNfX2dhcCdcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQG1lbWJlcm9mIGZpbGxnYXBzXG4gICAgICogRnVuY2nDs24gZGUgY3JlYWNpw7NuIGRlbCB3aWRnZXRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vVmFyIGRlY2xhcmF0aW9uIGdsb2JhbGVzXG4gICAgICAgIHRoaXMuX2dhcHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbnVtYmVyR2FwcztcbiAgICAgICAgdGhpcy5fbnVtYmVyR2Fwc0ZpbGxlZCA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuX2J1aWxkSHRtbCgpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5pY2lhIGVsIGNvbXBvbmVudGVcbiAgICAgKi9cbiAgICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG4gICAgX2J1aWxkSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBvYnRlbmVtb3MgdG9kb3MgbG9zIGdhcHMgcXVlIGhheVxuICAgICAgICB2YXIgX2dhcHMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUCk7XG4gICAgICAgIC8vIEd1YXJkYW1vcyBlbCBuw7ptZXJvIHRvdGFsIGRlIGdhcHNcbiAgICAgICAgdGhpcy5fbnVtYmVyR2FwcyA9IF9nYXBzLmxlbmd0aDtcbiAgICAgICAgLy8gU2kgbm8gZXhpc3RlIG5pbmfDum4gZ2FwIGxhbnphbW9zIHVuIGVycm9yXG4gICAgICAgIGlmICh0aGlzLl9udW1iZXJHYXBzID09IDApIHtcbiAgICAgICAgICAgIHRocm93ICdObyBzZSBoYSBlbmNvbnRyYWRvIG5pbmfDum4gZ2FwLiBOZWNlc2l0YXMgdXNhciBsYSBjbGFzZSAnICsgdGhpcy5RVUVSWV9HQVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBnYXBJbmRleCA9IDA7IGdhcEluZGV4IDwgX2dhcHMubGVuZ3RoOyBnYXBJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRHYXAgPSAkKF9nYXBzW2dhcEluZGV4XSksIGdhcFRleHQgPSBjdXJyZW50R2FwLnRleHQoKTtcbiAgICAgICAgICAgICAgICAvL0d1YXJkYW1vcyBsYXMgcGFsYWJyYXMgeSBlbCBodWVjbyBxdWUgbGUgY29ycmVzcG9uZGVcbiAgICAgICAgICAgICAgICAvLyBSZWVtcGxhemFtb3MgbGFzIHBhbGFicmFzIGRlamFuZG8gZWwgaHVlY28gcGFyYSBjb2xvY2FybGEgeSBhw7FhZGltb3NcbiAgICAgICAgICAgICAgICAvLyB1bmEgaW50ZXJyb2dhY2nDs24gcGFyYSBxdWUgZWwgdXN1YXJpbyBwdWVkYSBjb2xvY2FybGFcbiAgICAgICAgICAgICAgICAvLyBhw7FhZGltb3MgbGFzIGNsYXNlc1xuICAgICAgICAgICAgICAgIGN1cnJlbnRHYXBcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCd1aS1kcm9wcGFibGUgJyArIHRoaXMuQ0xBU1NfR0FQX0RFU1RJTlkpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKHRoaXMuQVRUUl9HQVBfREVTVElOWSwgZ2FwSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKHRoaXMuQVRUUl9HQVBfTEVOR1RILCBjdXJyZW50R2FwLnRleHQoKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKFwiPHNwYW4gY2xhc3M9XFxcIlwiICsgdGhpcy5DTEFTU19HQVBfRU1QVFkgKyBcIlxcXCI+Pzwvc3Bhbj5cIik7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0dhcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2lkR2FwJzogZ2FwSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICd3b3JkJzogZ2FwVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgJyRnYXAnOiBjdXJyZW50R2FwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLl9nYXBzLnB1c2gobmV3R2FwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYXdXb3JkcygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKlxuICAgICAqIFBpbnRhbW9zIGxhcyBwYWxhYnJhcyBkaXNwb25pYmxlcyBwYXJhIHJlbGxlbmFyIGxvcyBodWVjb3NcbiAgICAgKi9cbiAgICBfZHJhd1dvcmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGNyZWFtb3MgZWwgY29udGVuZWRvciBkb25kZSBpcsOhbiB1YmljYWRhcyBsYXMgcGFsYWJyYXNcbiAgICAgICAgdmFyIGh0bWwgPSAkKCc8ZGl2IGNsYXNzPVwiJyArIHRoaXMuQ0xBU1NfR0FQX1dPUkRTICsgJ1wiPjwvZGl2PicpO1xuICAgICAgICB2YXIgYXJyR2FwcyA9IHRoaXMuX3NodWZmbGVBcnJheSh0aGlzLl9nYXBzKTtcbiAgICAgICAgLy8gcmVjb3JyZW1vcyBsYXMgcGFsYWJyYXMgcXVlIHRlbmVtb3MgYWxtYWNlbmFkYXNcbiAgICAgICAgZm9yICh2YXIgZ2FwSW5kZXggPSAwOyBnYXBJbmRleCA8IGFyckdhcHMubGVuZ3RoOyBnYXBJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEdhcCA9IGFyckdhcHNbZ2FwSW5kZXhdO1xuICAgICAgICAgICAgdmFyICR3b3JkID0gJChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5DTEFTU19HQVBfV09SRCArIFwiIHVpLWRyYWdnYWJsZVxcXCIgXCIgKyB0aGlzLkFUVFJfR0FQX1dPUkQgKyBcIj1cXFwiXCIgKyBjdXJyZW50R2FwLmlkR2FwICsgXCJcXFwiPlwiICsgY3VycmVudEdhcC53b3JkICsgXCI8L2Rpdj5cIik7XG4gICAgICAgICAgICAkd29yZC5kYXRhKFwiZ2FwSWRcIiwgY3VycmVudEdhcC5pZEdhcCk7XG4gICAgICAgICAgICBjdXJyZW50R2FwLiR3b3JkID0gJHdvcmQ7XG4gICAgICAgICAgICBodG1sLmFwcGVuZCgkd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbGFzIGHDsWFkaW1vcyBhbCBlbGVtZW50byBwcmluY2lwYWxcbiAgICAgICAgdGhpcy5lbGVtZW50LnByZXBlbmQoaHRtbCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50cygpO1xuICAgIH0sXG4gICAgX2NyZWF0ZUV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIC8vbGlzdGVuZXIgY2xpY2sgZW4gcGFsYWJyYXMgZmFsbGlkYXNcbiAgICAgICAgdGhpcy5lbGVtZW50Lm9mZignY2xpY2suJyArIHRoaXMuTkFNRVNQQUNFKS5vbignY2xpY2suJyArIHRoaXMuTkFNRVNQQUNFLCB0aGlzLlFVRVJZX0dBUF9LTywgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vbktvR2FwQ2xpY2spO1xuICAgICAgICAvLyBoYWJpbGl0YW1vcyBxdWUgbGFzIHBhbGFicmFzIHNlIHB1ZWRhbiBtb3ZlclxuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9XT1JEKVxuICAgICAgICAgICAgLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICByZXZlcnQ6IFwidmFsaWRcIixcbiAgICAgICAgICAgIGNvbnRhaW5tZW50OiBcIiNhY3RpdmlkYWRcIlxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaGFiaWxpdGFtb3MgcXVlIGxvcyBodWVjb3MgcHVlZGFuIHJlY2liaXIgcGFsYWJyYXNcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfREVTVElOWSlcbiAgICAgICAgICAgIC5kcm9wcGFibGUoe1xuICAgICAgICAgICAgaG92ZXJDbGFzczogdGhpcy5DTEFTU19HQVBfSE9WRVJfREVTVElOWSxcbiAgICAgICAgICAgIGRyb3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICB0aGF0Ll9oYW5kbGVEcm9wKGV2ZW50LCB1aSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgX2hhbmRsZURyb3A6IGZ1bmN0aW9uIChldmVudCwgdWksIF90aGlzKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0Rpc2FibGVkKCkpIHtcbiAgICAgICAgICAgIHZhciAkd29yZCA9IHVpLmhlbHBlcjtcbiAgICAgICAgICAgIHZhciAkZ2FwID0gJChfdGhpcyk7XG4gICAgICAgICAgICB2YXIgd29yZEdhcElkID0gJHdvcmQuZGF0YShcImdhcElkXCIpO1xuICAgICAgICAgICAgdmFyIGlkRGVzdGlueSA9ICRnYXAuYXR0cih0aGlzLkFUVFJfR0FQX0RFU1RJTlkpO1xuICAgICAgICAgICAgdmFyIHdvcmRHYXAgPSB0aGlzLl9nZXRHYXBCeUlkKHdvcmRHYXBJZCk7XG4gICAgICAgICAgICB2YXIgd29yZCA9IHdvcmRHYXAud29yZDtcbiAgICAgICAgICAgIC8vIGNvbXByb2JhbW9zIHNpIGhhIGFjZXJ0YWRvXG4gICAgICAgICAgICB2YXIgZXZhbHVhdGUgPSB0aGlzLkdBUF9TVEFURS5LTztcbiAgICAgICAgICAgIC8vIEV2YWx1YW1vcyBzaSBlbCBpZCBkZSBsYSBwYWxhYnJhIG9yaWdlbiBjb3JyZXNwb25kZSBjb24gbGEgZGVsIGh1ZWNvXG4gICAgICAgICAgICAvLyBvIHNpIGxhIHBhbGFicmEgcXVlIHF1ZXJlbW9zIHViaWNhciBzZSBjb3JyZXNwb25kZSBjb24gbGEgZGVsIGh1ZWNvLlxuICAgICAgICAgICAgLy8gRGUgZXN0YSBtYW5lcmEgc2UgcHVlZGVuIGNvbG9jYXIgZW4gdW4gbWlzbW8gaHVlY28gcGFsYWJyYXMgcXVlIHNvbiBpZMOpbnRpY2FzLlxuICAgICAgICAgICAgLy8gU2kgZW4gZG9zIGh1ZWNvcyBlc3TDoSBsYSBtaXNtYSBwYWxhYnJhLCBwb2RlbW9zIGludGVyY2FtYmlhcmxhcyB5IHBvbmVybGFzIGVuXG4gICAgICAgICAgICAvLyBjdWFscXVpZXJhIGRlIGxvcyBkb3MgaHVlY29zXG4gICAgICAgICAgICBpZiAod29yZEdhcElkID09IGlkRGVzdGlueSkge1xuICAgICAgICAgICAgICAgIGV2YWx1YXRlID0gdGhpcy5HQVBfU1RBVEUuT0s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb2xvY2Ftb3MgbGEgcGFsYWJyYSBlbiBlbCBodWVjb1xuICAgICAgICAgICAgJGdhcC5hZGRDbGFzcyh0aGlzLkNMQVNTX0dBUF9GSUxMRUQpLmFkZENsYXNzKGV2YWx1YXRlID09PSB0aGlzLkdBUF9TVEFURS5PSyA/IHRoaXMuQ0xBU1NfR0FQX1NUQVRFX09LIDogdGhpcy5DTEFTU19HQVBfU1RBVEVfS08pLnRleHQod29yZCk7XG4gICAgICAgICAgICAkZ2FwLmRhdGEoXCJjdXJyZW50V29yZFwiLCB3b3JkR2FwSWQpO1xuICAgICAgICAgICAgLy8gZWxpbW5pYW1vcyBsYSBwYWxhYnJhIGRlbCBvcmlnZW5cbiAgICAgICAgICAgIHdvcmRHYXAuJHdvcmQgPSAkd29yZC5kZXRhY2goKTtcbiAgICAgICAgICAgIC8vIGV2YWx1YW1vcyBzaSBzZSBoYSB0ZXJtaW5hZG8gZWwgZWplcmNpY2lvXG4gICAgICAgICAgICB0aGlzLl9udW1iZXJHYXBzRmlsbGVkID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfRklMTEVEKS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLl9udW1iZXJHYXBzT0sgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9TVEFURV9PSykubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHRoaXMuX251bWJlckdhcHNGaWxsZWQgPT0gdGhpcy5fbnVtYmVyR2Fwcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIodGhpcy5PTl9GSUxMR0FQU19DT01QTEVURUQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX251bWJlckdhcHNPSyA9PSB0aGlzLl9udW1iZXJHYXBzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcih0aGlzLk9OX0ZJTExHQVBTX09LKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9XT1JEUylcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX29uS29HYXBDbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gZS5kYXRhLmluc3RhbmNlLCAkZ2FwID0gJChlLnRhcmdldCksIHdvcmRJZCA9ICRnYXAuZGF0YShcImN1cnJlbnRXb3JkXCIpLCBnYXAgPSBpbnN0YW5jZS5fZ2V0R2FwQnlJZCh3b3JkSWQpO1xuICAgICAgICAkZ2FwXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoaW5zdGFuY2UuQ0xBU1NfR0FQX1NUQVRFX0tPICsgXCIgXCIgKyBpbnN0YW5jZS5DTEFTU19HQVBfRklMTEVEKVxuICAgICAgICAgICAgLmFkZENsYXNzKGluc3RhbmNlLkNMQVNTX0dBUF9FTVBUWSlcbiAgICAgICAgICAgIC50ZXh0KCc/Jyk7XG4gICAgICAgIC8vQcOxYWRpbW9zIGVsIGdhcCBpbmljaWFsIHBhcmEgcG9kZXIgdm9sdmVyIGEgZ2VuZXJhcmxvXG4gICAgICAgIGlmIChnYXAud29yZCAhPSAnPycpIHtcbiAgICAgICAgICAgIHZhciBfZ2Fwc19vcmlnaW4gPSBpbnN0YW5jZS5lbGVtZW50LmZpbmQoaW5zdGFuY2UuUVVFUllfR0FQX1dPUkRTKTtcbiAgICAgICAgICAgIF9nYXBzX29yaWdpbi5hcHBlbmQoZ2FwLiR3b3JkKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9XT1JEKS5kcmFnZ2FibGUoXCJkaXNhYmxlXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9ERVNUSU5ZKS5kcm9wcGFibGUoXCJkaXNhYmxlXCIpO1xuICAgIH0sXG4gICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIHRoaXMuX3dvcmRzID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfREVTVElOWSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQX1dPUkQpLmRyYWdnYWJsZShcImVuYWJsZVwiKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfREVTVElOWSkuZHJvcHBhYmxlKFwiZW5hYmxlXCIpO1xuICAgIH0sXG4gICAgLypcbiAgICAgKiBPYnRpZW5lIGxhIHBhbGFicmEgcXVlIGNvcnJlc3BvbmRlIGFsIGh1ZWNvIGRlIGRlc3Rpbm8gc2VsZWNjaW9uYWRvXG4gICAgICovXG4gICAgX2dldEdhcEJ5SWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB2YXIgZ2FwcyA9IHRoaXMuX2dhcHMsIHJlc3VsdDtcbiAgICAgICAgZm9yICh2YXIgZ2FwSW5kZXggPSAwOyBnYXBJbmRleCA8IGdhcHMubGVuZ3RoOyBnYXBJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEdhcCA9IGdhcHNbZ2FwSW5kZXhdO1xuICAgICAgICAgICAgaWYgKGlkID09IGN1cnJlbnRHYXAuaWRHYXApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50R2FwO1xuICAgICAgICAgICAgICAgIGdhcEluZGV4ID0gZ2Fwcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIC8qXG4gICAgICogIERldnVlbHZlIHVuIG9yZGVuIGFsZWF0b3JpbyBkZWwgYXJyYXkgcXVlIHNlIGxlIHBhc2FcbiAgICAgKiAgQHBhcmFtcyBhcnJheVxuICAgICAqL1xuICAgIF9zaHVmZmxlQXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICBmb3IgKHZhciBwb3NpdGlvbkluZGV4ID0gYXJyYXkubGVuZ3RoIC0gMTsgcG9zaXRpb25JbmRleCA+IDA7IHBvc2l0aW9uSW5kZXgtLSkge1xuICAgICAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAocG9zaXRpb25JbmRleCArIDEpKTtcbiAgICAgICAgICAgIHZhciB0ZW1wID0gYXJyYXlbcG9zaXRpb25JbmRleF07XG4gICAgICAgICAgICBhcnJheVtwb3NpdGlvbkluZGV4XSA9IGFycmF5W2pdO1xuICAgICAgICAgICAgYXJyYXlbal0gPSB0ZW1wO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG59KTtcbiJdLCJmaWxlIjoianFGaWxsZ2Fwcy5qcyJ9
