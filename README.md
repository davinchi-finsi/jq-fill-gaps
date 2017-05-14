# README #

El recurso de fillgaps consiste en mostrar al usuario un texto o un conjunto de frases donde se encuentran intercalados huecos. Estos huecos se corresponden con una palabra que el usuario debe encontrar.

Por otra parte, en una lista, aparecen todas las palabras, tantas como huecos. El usuario mediante arrastrar y soltar seleccionará una palabra y la soltará en el hueco correspondiente que considere. Si tiene la opción de feedback inmediato seleccionado, una vez que coloque la palabra en el hueco elegido, la aplicación le dirá si es correcta o no. En caso de no serlo, podrá volver a reubicarla haciendo clic sobre ella.

### Implementar el recurso ###

En primer lugar tenemos que añadir a un elemento html (normalmente un div) la clase **hz-fill-gaps**.

    <div class="hz-fill-gaps"></div>

A continuación escribimos dentro el texto pudiendo utilizar elementos html.

    <div class="hz-fill-gaps">Lorem ipsum dolor sit amet, 
    consectetur adipiscing elit, sed do eiusmod tempor incididunt 
    ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
    quis nostrud exercitation ullamco laboris nisi ut aliquip 
    ex ea commodo consequat.
    </div>

Una vez que hemos decidido cuáles son las palabras que vamos a utilizar para que el usuario busque, las metemos dentro de un span con la clase **hz-fill-gaps-gap**. Quedando así: 

    <span class="hz-fill-gaps-gap">palabra</span>

Así pues, el texto anterior quedaría de la siguiente manera:

    <div class="hz-fill-gaps">Lorem ipsum dolor sit amet, 
    <span class="hz-fill-gaps-gap">consectetur</span> adipiscing elit, 
    sed do eiusmod tempor <span class="hz-fill-gaps-gap">incididunt </span>
    ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
    quis <span class="hz-fill-gaps-gap">ullamco</span>laboris 
    nisi ut aliquip ex ea commodo consequat.
    </div>

En el ejemplo, el usuario tendrá que buscar las palabras: **consectetur**, **incididunt** y **ullamco**.

La aplicación colocará las palabras aleatoriamente.