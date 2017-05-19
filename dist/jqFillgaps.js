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
    QUERY_GAP_STATE_KO: '.hz-fillgaps__gap--ko',
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
        this.element.off('click.' + this.NAMESPACE).on('click.' + this.NAMESPACE, this.QUERY_GAP_STATE_KO, { instance: this }, this._onKoGapClick);
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
    isDisabled: function () {
        return this.options.disabled;
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
            wordGap.moved = true;
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
        var instance = e.data.instance;
        if (!instance.isDisabled()) {
            var $gap = $(e.target), wordId = $gap.data("currentWord"), gap = instance._getGapById(wordId);
            if (gap.moved == true) {
                $gap
                    .removeClass(instance.CLASS_GAP_STATE_KO + " " + instance.CLASS_GAP_FILLED)
                    .addClass(instance.CLASS_GAP_EMPTY)
                    .text('?');
                //Añadimos el gap inicial para poder volver a generarlo
                if (gap.word != '?') {
                    var _gaps_origin = instance.element.find(instance.QUERY_GAP_WORDS);
                    _gaps_origin.append(gap.$word);
                    gap.moved = false;
                }
            }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcUZpbGxnYXBzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzIGZpbGxnYXBzXG4gKi9cbiQud2lkZ2V0KFwiaHouZmlsbGdhcHNcIiwge1xuICAgIC8qKlxuICAgICAqIEBtZW1iZXJvZiBmaWxsZ2Fwc1xuICAgICAqL1xuICAgIE5BTUVTUEFDRTogXCJmaWxsZ2Fwc1wiLFxuICAgIEdBUF9TVEFURToge1xuICAgICAgICBLTzogMCxcbiAgICAgICAgT0s6IDFcbiAgICB9LFxuICAgIE9OX0ZJTExHQVBTX1NUQVJUOiBcImZpbGxnYXBzOnN0YXJ0XCIsXG4gICAgT05fRklMTEdBUFNfT1ZFUjogJ2ZpbGxnYXBzOm92ZXInLFxuICAgIE9OX0ZJTExHQVBTX0NPTVBMRVRFRDogJ2ZpbGxnYXBzOmNvbXBsZXRlZCcsXG4gICAgT05fRklMTEdBUFNfT0s6ICdmaWxsZ2FwczpvaycsXG4gICAgQ0xBU1NfR0FQUzogJ2h6LWZpbGxnYXBzX19nYXAnLFxuICAgIENMQVNTX0dBUF9XT1JEUzogJ2h6LWZpbGxnYXBzX193b3JkcycsXG4gICAgQ0xBU1NfR0FQX1dPUkQ6ICdoei1maWxsZ2Fwc19fd29yZCcsXG4gICAgQ0xBU1NfR0FQX0RFU1RJTlk6ICdoei1maWxsZ2Fwc19fZ2FwLS1kZXN0aW55JyxcbiAgICBDTEFTU19HQVBfRU1QVFk6ICdoei1maWxsZ2Fwc19fZ2FwLS1lbXB0eScsXG4gICAgQ0xBU1NfR0FQX09SSUdJTjogJ2h6LWZpbGwtZ2Fwcy1nYXBzX29yaWdpbicsXG4gICAgQ0xBU1NfR0FQX0hPVkVSX0RFU1RJTlk6ICdob3Zlcl9kZXN0aW55JyxcbiAgICBDTEFTU19HQVBfRklMTEVEOiAnaHotZmlsbGdhcHNfX2dhcC0tZmlsbGVkJyxcbiAgICBDTEFTU19HQVBfU1RBVEVfT0s6ICdoei1maWxsZ2Fwc19fZ2FwLS1vaycsXG4gICAgQ0xBU1NfR0FQX1NUQVRFX0tPOiAnaHotZmlsbGdhcHNfX2dhcC0ta28nLFxuICAgIFFVRVJZX0dBUDogJy5oei1maWxsZ2Fwc19fZ2FwJyxcbiAgICBRVUVSWV9HQVBfT1JJR0lOOiAnLmh6LWZpbGwtZ2Fwcy1nYXBfb3JpZ2luJyxcbiAgICBRVUVSWV9HQVBfREVTVElOWTogJy5oei1maWxsZ2Fwc19fZ2FwLS1kZXN0aW55JyxcbiAgICBRVUVSWV9HQVBfV09SRDogJy5oei1maWxsZ2Fwc19fd29yZCcsXG4gICAgUVVFUllfR0FQX1dPUkRTOiAnLmh6LWZpbGxnYXBzX193b3JkcycsXG4gICAgUVVFUllfR0FQX0ZJTExFRDogJy5oei1maWxsZ2Fwc19fZ2FwLS1maWxsZWQnLFxuICAgIFFVRVJZX0dBUF9TVEFURV9PSzogJy5oei1maWxsZ2Fwc19fZ2FwLS1vaycsXG4gICAgUVVFUllfR0FQX1NUQVRFX0tPOiAnLmh6LWZpbGxnYXBzX19nYXAtLWtvJyxcbiAgICBBVFRSX0dBUF9XT1JEOiAnZGF0YS1oei1maWxsZ2Fwcy13b3JkJyxcbiAgICBBVFRSX0dBUF9ERVNUSU5ZOiAnZGF0YS1oei1maWxsZ2Fwcy1nYXAtZGVzdGlueScsXG4gICAgQVRUUl9HQVBfTEVOR1RIOiAnZGF0YS1oei1maWxsZ2Fwcy1nYXAtbGVuZ2h0JyxcbiAgICAvLyBEZWZhdWx0IG9wdGlvbnMuXG4gICAgb3B0aW9uczoge1xuICAgICAgICBpbW1lZGlhdGVfZmVlZGJhY2s6IHRydWUsXG4gICAgICAgIGNsYXNzZXM6IHtcbiAgICAgICAgICAgICdoei1maWxsZ2Fwcyc6ICdoei1maWxsZ2Fwcy0tZGVmYXVsdCcsXG4gICAgICAgICAgICAnaHotZmlsbGdhcHNfX2dhcCc6ICdoei1maWxsZ2Fwc19fZ2FwJ1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBAbWVtYmVyb2YgZmlsbGdhcHNcbiAgICAgKiBGdW5jacOzbiBkZSBjcmVhY2nDs24gZGVsIHdpZGdldFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIF9jcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9WYXIgZGVjbGFyYXRpb24gZ2xvYmFsZXNcbiAgICAgICAgdGhpcy5fZ2FwcyA9IFtdO1xuICAgICAgICB0aGlzLl9udW1iZXJHYXBzO1xuICAgICAgICB0aGlzLl9udW1iZXJHYXBzRmlsbGVkID0gMDtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fYnVpbGRIdG1sKCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbmljaWEgZWwgY29tcG9uZW50ZVxuICAgICAqL1xuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcbiAgICBfYnVpbGRIdG1sOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIG9idGVuZW1vcyB0b2RvcyBsb3MgZ2FwcyBxdWUgaGF5XG4gICAgICAgIHZhciBfZ2FwcyA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQKTtcbiAgICAgICAgLy8gR3VhcmRhbW9zIGVsIG7Dum1lcm8gdG90YWwgZGUgZ2Fwc1xuICAgICAgICB0aGlzLl9udW1iZXJHYXBzID0gX2dhcHMubGVuZ3RoO1xuICAgICAgICAvLyBTaSBubyBleGlzdGUgbmluZ8O6biBnYXAgbGFuemFtb3MgdW4gZXJyb3JcbiAgICAgICAgaWYgKHRoaXMuX251bWJlckdhcHMgPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgJ05vIHNlIGhhIGVuY29udHJhZG8gbmluZ8O6biBnYXAuIE5lY2VzaXRhcyB1c2FyIGxhIGNsYXNlICcgKyB0aGlzLlFVRVJZX0dBUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGdhcEluZGV4ID0gMDsgZ2FwSW5kZXggPCBfZ2Fwcy5sZW5ndGg7IGdhcEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudEdhcCA9ICQoX2dhcHNbZ2FwSW5kZXhdKSwgZ2FwVGV4dCA9IGN1cnJlbnRHYXAudGV4dCgpO1xuICAgICAgICAgICAgICAgIC8vR3VhcmRhbW9zIGxhcyBwYWxhYnJhcyB5IGVsIGh1ZWNvIHF1ZSBsZSBjb3JyZXNwb25kZVxuICAgICAgICAgICAgICAgIC8vIFJlZW1wbGF6YW1vcyBsYXMgcGFsYWJyYXMgZGVqYW5kbyBlbCBodWVjbyBwYXJhIGNvbG9jYXJsYSB5IGHDsWFkaW1vc1xuICAgICAgICAgICAgICAgIC8vIHVuYSBpbnRlcnJvZ2FjacOzbiBwYXJhIHF1ZSBlbCB1c3VhcmlvIHB1ZWRhIGNvbG9jYXJsYVxuICAgICAgICAgICAgICAgIC8vIGHDsWFkaW1vcyBsYXMgY2xhc2VzXG4gICAgICAgICAgICAgICAgY3VycmVudEdhcFxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ3VpLWRyb3BwYWJsZSAnICsgdGhpcy5DTEFTU19HQVBfREVTVElOWSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIodGhpcy5BVFRSX0dBUF9ERVNUSU5ZLCBnYXBJbmRleClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIodGhpcy5BVFRSX0dBUF9MRU5HVEgsIGN1cnJlbnRHYXAudGV4dCgpLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgLmh0bWwoXCI8c3BhbiBjbGFzcz1cXFwiXCIgKyB0aGlzLkNMQVNTX0dBUF9FTVBUWSArIFwiXFxcIj4/PC9zcGFuPlwiKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3R2FwID0ge1xuICAgICAgICAgICAgICAgICAgICAnaWRHYXAnOiBnYXBJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgJ3dvcmQnOiBnYXBUZXh0LFxuICAgICAgICAgICAgICAgICAgICAnJGdhcCc6IGN1cnJlbnRHYXBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuX2dhcHMucHVzaChuZXdHYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhd1dvcmRzKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qXG4gICAgICogUGludGFtb3MgbGFzIHBhbGFicmFzIGRpc3BvbmlibGVzIHBhcmEgcmVsbGVuYXIgbG9zIGh1ZWNvc1xuICAgICAqL1xuICAgIF9kcmF3V29yZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gY3JlYW1vcyBlbCBjb250ZW5lZG9yIGRvbmRlIGlyw6FuIHViaWNhZGFzIGxhcyBwYWxhYnJhc1xuICAgICAgICB2YXIgaHRtbCA9ICQoJzxkaXYgY2xhc3M9XCInICsgdGhpcy5DTEFTU19HQVBfV09SRFMgKyAnXCI+PC9kaXY+Jyk7XG4gICAgICAgIHZhciBhcnJHYXBzID0gdGhpcy5fc2h1ZmZsZUFycmF5KHRoaXMuX2dhcHMpO1xuICAgICAgICAvLyByZWNvcnJlbW9zIGxhcyBwYWxhYnJhcyBxdWUgdGVuZW1vcyBhbG1hY2VuYWRhc1xuICAgICAgICBmb3IgKHZhciBnYXBJbmRleCA9IDA7IGdhcEluZGV4IDwgYXJyR2Fwcy5sZW5ndGg7IGdhcEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50R2FwID0gYXJyR2Fwc1tnYXBJbmRleF07XG4gICAgICAgICAgICB2YXIgJHdvcmQgPSAkKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkNMQVNTX0dBUF9XT1JEICsgXCIgdWktZHJhZ2dhYmxlXFxcIiBcIiArIHRoaXMuQVRUUl9HQVBfV09SRCArIFwiPVxcXCJcIiArIGN1cnJlbnRHYXAuaWRHYXAgKyBcIlxcXCI+XCIgKyBjdXJyZW50R2FwLndvcmQgKyBcIjwvZGl2PlwiKTtcbiAgICAgICAgICAgICR3b3JkLmRhdGEoXCJnYXBJZFwiLCBjdXJyZW50R2FwLmlkR2FwKTtcbiAgICAgICAgICAgIGN1cnJlbnRHYXAuJHdvcmQgPSAkd29yZDtcbiAgICAgICAgICAgIGh0bWwuYXBwZW5kKCR3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBsYXMgYcOxYWRpbW9zIGFsIGVsZW1lbnRvIHByaW5jaXBhbFxuICAgICAgICB0aGlzLmVsZW1lbnQucHJlcGVuZChodG1sKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlRXZlbnRzKCk7XG4gICAgfSxcbiAgICBfY3JlYXRlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgLy9saXN0ZW5lciBjbGljayBlbiBwYWxhYnJhcyBmYWxsaWRhc1xuICAgICAgICB0aGlzLmVsZW1lbnQub2ZmKCdjbGljay4nICsgdGhpcy5OQU1FU1BBQ0UpLm9uKCdjbGljay4nICsgdGhpcy5OQU1FU1BBQ0UsIHRoaXMuUVVFUllfR0FQX1NUQVRFX0tPLCB7IGluc3RhbmNlOiB0aGlzIH0sIHRoaXMuX29uS29HYXBDbGljayk7XG4gICAgICAgIC8vIGhhYmlsaXRhbW9zIHF1ZSBsYXMgcGFsYWJyYXMgc2UgcHVlZGFuIG1vdmVyXG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQX1dPUkQpXG4gICAgICAgICAgICAuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgIHJldmVydDogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgY29udGFpbm1lbnQ6IFwiI2FjdGl2aWRhZFwiXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBoYWJpbGl0YW1vcyBxdWUgbG9zIGh1ZWNvcyBwdWVkYW4gcmVjaWJpciBwYWxhYnJhc1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9ERVNUSU5ZKVxuICAgICAgICAgICAgLmRyb3BwYWJsZSh7XG4gICAgICAgICAgICBob3ZlckNsYXNzOiB0aGlzLkNMQVNTX0dBUF9IT1ZFUl9ERVNUSU5ZLFxuICAgICAgICAgICAgZHJvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIHRoYXQuX2hhbmRsZURyb3AoZXZlbnQsIHVpLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBpc0Rpc2FibGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZGlzYWJsZWQ7XG4gICAgfSxcbiAgICBfaGFuZGxlRHJvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSwgX3RoaXMpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQoKSkge1xuICAgICAgICAgICAgdmFyICR3b3JkID0gdWkuaGVscGVyO1xuICAgICAgICAgICAgdmFyICRnYXAgPSAkKF90aGlzKTtcbiAgICAgICAgICAgIHZhciB3b3JkR2FwSWQgPSAkd29yZC5kYXRhKFwiZ2FwSWRcIik7XG4gICAgICAgICAgICB2YXIgaWREZXN0aW55ID0gJGdhcC5hdHRyKHRoaXMuQVRUUl9HQVBfREVTVElOWSk7XG4gICAgICAgICAgICB2YXIgd29yZEdhcCA9IHRoaXMuX2dldEdhcEJ5SWQod29yZEdhcElkKTtcbiAgICAgICAgICAgIHZhciB3b3JkID0gd29yZEdhcC53b3JkO1xuICAgICAgICAgICAgLy8gY29tcHJvYmFtb3Mgc2kgaGEgYWNlcnRhZG9cbiAgICAgICAgICAgIHZhciBldmFsdWF0ZSA9IHRoaXMuR0FQX1NUQVRFLktPO1xuICAgICAgICAgICAgLy8gRXZhbHVhbW9zIHNpIGVsIGlkIGRlIGxhIHBhbGFicmEgb3JpZ2VuIGNvcnJlc3BvbmRlIGNvbiBsYSBkZWwgaHVlY29cbiAgICAgICAgICAgIC8vIG8gc2kgbGEgcGFsYWJyYSBxdWUgcXVlcmVtb3MgdWJpY2FyIHNlIGNvcnJlc3BvbmRlIGNvbiBsYSBkZWwgaHVlY28uXG4gICAgICAgICAgICAvLyBEZSBlc3RhIG1hbmVyYSBzZSBwdWVkZW4gY29sb2NhciBlbiB1biBtaXNtbyBodWVjbyBwYWxhYnJhcyBxdWUgc29uIGlkw6ludGljYXMuXG4gICAgICAgICAgICAvLyBTaSBlbiBkb3MgaHVlY29zIGVzdMOhIGxhIG1pc21hIHBhbGFicmEsIHBvZGVtb3MgaW50ZXJjYW1iaWFybGFzIHkgcG9uZXJsYXMgZW5cbiAgICAgICAgICAgIC8vIGN1YWxxdWllcmEgZGUgbG9zIGRvcyBodWVjb3NcbiAgICAgICAgICAgIGlmICh3b3JkR2FwSWQgPT0gaWREZXN0aW55KSB7XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUgPSB0aGlzLkdBUF9TVEFURS5PSztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbG9jYW1vcyBsYSBwYWxhYnJhIGVuIGVsIGh1ZWNvXG4gICAgICAgICAgICAkZ2FwLmFkZENsYXNzKHRoaXMuQ0xBU1NfR0FQX0ZJTExFRCkuYWRkQ2xhc3MoZXZhbHVhdGUgPT09IHRoaXMuR0FQX1NUQVRFLk9LID8gdGhpcy5DTEFTU19HQVBfU1RBVEVfT0sgOiB0aGlzLkNMQVNTX0dBUF9TVEFURV9LTykudGV4dCh3b3JkKTtcbiAgICAgICAgICAgICRnYXAuZGF0YShcImN1cnJlbnRXb3JkXCIsIHdvcmRHYXBJZCk7XG4gICAgICAgICAgICAvLyBlbGltbmlhbW9zIGxhIHBhbGFicmEgZGVsIG9yaWdlblxuICAgICAgICAgICAgd29yZEdhcC4kd29yZCA9ICR3b3JkLmRldGFjaCgpO1xuICAgICAgICAgICAgd29yZEdhcC5tb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBldmFsdWFtb3Mgc2kgc2UgaGEgdGVybWluYWRvIGVsIGVqZXJjaWNpb1xuICAgICAgICAgICAgdGhpcy5fbnVtYmVyR2Fwc0ZpbGxlZCA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQX0ZJTExFRCkubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5fbnVtYmVyR2Fwc09LID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfU1RBVEVfT0spLmxlbmd0aDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9udW1iZXJHYXBzRmlsbGVkID09IHRoaXMuX251bWJlckdhcHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyKHRoaXMuT05fRklMTEdBUFNfQ09NUExFVEVEKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9udW1iZXJHYXBzT0sgPT0gdGhpcy5fbnVtYmVyR2Fwcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIodGhpcy5PTl9GSUxMR0FQU19PSyk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfV09SRFMpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9vbktvR2FwQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZTtcbiAgICAgICAgaWYgKCFpbnN0YW5jZS5pc0Rpc2FibGVkKCkpIHtcbiAgICAgICAgICAgIHZhciAkZ2FwID0gJChlLnRhcmdldCksIHdvcmRJZCA9ICRnYXAuZGF0YShcImN1cnJlbnRXb3JkXCIpLCBnYXAgPSBpbnN0YW5jZS5fZ2V0R2FwQnlJZCh3b3JkSWQpO1xuICAgICAgICAgICAgaWYgKGdhcC5tb3ZlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgJGdhcFxuICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoaW5zdGFuY2UuQ0xBU1NfR0FQX1NUQVRFX0tPICsgXCIgXCIgKyBpbnN0YW5jZS5DTEFTU19HQVBfRklMTEVEKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoaW5zdGFuY2UuQ0xBU1NfR0FQX0VNUFRZKVxuICAgICAgICAgICAgICAgICAgICAudGV4dCgnPycpO1xuICAgICAgICAgICAgICAgIC8vQcOxYWRpbW9zIGVsIGdhcCBpbmljaWFsIHBhcmEgcG9kZXIgdm9sdmVyIGEgZ2VuZXJhcmxvXG4gICAgICAgICAgICAgICAgaWYgKGdhcC53b3JkICE9ICc/Jykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2dhcHNfb3JpZ2luID0gaW5zdGFuY2UuZWxlbWVudC5maW5kKGluc3RhbmNlLlFVRVJZX0dBUF9XT1JEUyk7XG4gICAgICAgICAgICAgICAgICAgIF9nYXBzX29yaWdpbi5hcHBlbmQoZ2FwLiR3b3JkKTtcbiAgICAgICAgICAgICAgICAgICAgZ2FwLm1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQX1dPUkQpLmRyYWdnYWJsZShcImRpc2FibGVcIik7XG4gICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfR0FQX0RFU1RJTlkpLmRyb3BwYWJsZShcImRpc2FibGVcIik7XG4gICAgfSxcbiAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fd29yZHMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9ERVNUSU5ZKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9HQVBfV09SRCkuZHJhZ2dhYmxlKFwiZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0dBUF9ERVNUSU5ZKS5kcm9wcGFibGUoXCJlbmFibGVcIik7XG4gICAgfSxcbiAgICAvKlxuICAgICAqIE9idGllbmUgbGEgcGFsYWJyYSBxdWUgY29ycmVzcG9uZGUgYWwgaHVlY28gZGUgZGVzdGlubyBzZWxlY2Npb25hZG9cbiAgICAgKi9cbiAgICBfZ2V0R2FwQnlJZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHZhciBnYXBzID0gdGhpcy5fZ2FwcywgcmVzdWx0O1xuICAgICAgICBmb3IgKHZhciBnYXBJbmRleCA9IDA7IGdhcEluZGV4IDwgZ2Fwcy5sZW5ndGg7IGdhcEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50R2FwID0gZ2Fwc1tnYXBJbmRleF07XG4gICAgICAgICAgICBpZiAoaWQgPT0gY3VycmVudEdhcC5pZEdhcCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnRHYXA7XG4gICAgICAgICAgICAgICAgZ2FwSW5kZXggPSBnYXBzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLypcbiAgICAgKiAgRGV2dWVsdmUgdW4gb3JkZW4gYWxlYXRvcmlvIGRlbCBhcnJheSBxdWUgc2UgbGUgcGFzYVxuICAgICAqICBAcGFyYW1zIGFycmF5XG4gICAgICovXG4gICAgX3NodWZmbGVBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIGZvciAodmFyIHBvc2l0aW9uSW5kZXggPSBhcnJheS5sZW5ndGggLSAxOyBwb3NpdGlvbkluZGV4ID4gMDsgcG9zaXRpb25JbmRleC0tKSB7XG4gICAgICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChwb3NpdGlvbkluZGV4ICsgMSkpO1xuICAgICAgICAgICAgdmFyIHRlbXAgPSBhcnJheVtwb3NpdGlvbkluZGV4XTtcbiAgICAgICAgICAgIGFycmF5W3Bvc2l0aW9uSW5kZXhdID0gYXJyYXlbal07XG4gICAgICAgICAgICBhcnJheVtqXSA9IHRlbXA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbn0pO1xuIl0sImZpbGUiOiJqcUZpbGxnYXBzLmpzIn0=
