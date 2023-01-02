# Letalska igra

### Avtorja:
- Janez Sedeljšak 63200261
- Marko Vrečer 63200329

Osnovni koncept igre je preprosta poučna letalska igra, kjer bi morali kot igralec odlagati pakete, kamor bi igra zahtevala. Za okolje bi vzeli pomanjšano verzijo Zemlje, ki je nekako v takem merilu, da jo lahko obletimo približno v minuti.

Sam cilj igre bi bil odlagati pakete v posamezne "države", ki nam jih igra naključno izbere. Na primer paket moramo odložiti v Sloveniji, torej se moramo z letalom zapeljati nad našo državo in tam spustiti naš paket. 

Konceptualna ideja je načeloma vzeta iz "video" serije iz platforme ["YouTube"](https://www.youtube.com/watch?v=sLqXFF8mlEU&t=1593s).

### Zaznavanje trkov
V igro je namen dodati tudi oblake, ki se dinamično izrisujejo in predstavljajo objekte, ki ob trku z letalom izginejo... Sami oblaki so načeloma skupek večih "sfer" in ob trku v posamezno "sfero" ta izgine.

### Koncept gravitacije znotraj igre
V igri načeloma ne bo klasičnega koncepta gravitacije, saj je osrednji lik letalo. To klasično gravitacijo lahko implemtiramo le pri paketih, ki jih bomo morali spuščati iz letala, pa še tukaj gre le za padanje.

Če bo osrednji del igre "sfera" moramo letalo načeloma izrisovati na neki konstanti razdaliji od središča in enako velja za oblake...

### Izrisovanje zemlje
V osnovi bi lahko celotno zemljo izrisali, kot en `gltf` model, ampak tukaj se zna pojaviti težava, če bo ta model prevelik in bo potrebno dinamično izrisovanje. Kot rešitev bi lahko "sfero" razdelili na manjše komponente in potem izrisovati le "aktivno" področje (komponento).

### Mehanika gibanja
V samo gibanje letala bi seveda vključili, tudi horizontalno in vertikalno gibanje, tako se lahko recimo izognemo oblakom ali pa se pomaknemo nižje, da lahko odložimo paket. 

Ob gibanju levo/desno, pa bi kamero in letalo rotirali. Recimo v primeru, ko se gibamo desno kamero rotiramo za nekaj stopinj v smeri urinega kazalca in jo potem stabiliziramo v prvotno stanje.
