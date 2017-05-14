# README #

El recurso de fillgaps consiste en mostrar al usuario un texto o un conjunto de frases donde se encuentran intercalados huecos. Estos huecos se corresponden con una palabra que el usuario debe encontrar.

Por otra parte, en una lista, aparecen todas las palabras, tantas como huecos. El usuario mediante arrastrar y soltar seleccionará una palabra y la soltará en el hueco correspondiente que considere. Si tiene la opción de feedback inmediato seleccionado, una vez que coloque la palabra en el hueco elegido, la aplicación le dirá si es correcta o no. En caso de no serlo, podrá volver a reubicarla haciendo clic sobre ella.

### Implementar el recurso ###

En primer lugar tenemos que añadir a un elemento html (normalmente un div) la clase **hz-fill-gaps**.

    <div class="hz-fill-gaps"></div>

A continuación escribimos dentro el texto pudiendo utilizar elementos html.