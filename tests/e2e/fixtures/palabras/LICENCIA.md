# Test recordings — licenses (S11, ADR-023)

Single words spoken by adult volunteers of **Lingua Libre** (Wikimedia Commons), used only to measure the
on-device recognizer. **Never the family's voice.** Each file was converted to 16 kHz mono 16-bit WAV (nothing
else changed); as adaptations of CC BY-SA 4.0 works they are shared under the same license
(https://creativecommons.org/licenses/by-sa/4.0/). Author, license and source page of every file:

| File | Word | Author (Speaker / Recorder) | License | Source |
| ---- | ---- | --------------------------- | ------- | ------ |
| `es/pez.wav` | pez | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-pez.wav |
| `es/perro.wav` | perro | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-perro.wav |
| `es/huevo.wav` | huevo | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-huevo.wav |
| `es/sol.wav` | sol | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-sol.wav |
| `es/luna.wav` | luna | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-luna.wav |
| `es/estrella.wav` | estrella | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-estrella.wav |
| `es/agua.wav` | agua | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-agua.wav |
| `es/nube.wav` | nube | Anonymât / Kvardek du | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Anonym%C3%A2t_(Kvardek_du)-nube.wav |
| `es/gato.wav` | gato | Eavqwiki / Eavqwiki | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Eavqwiki-gato.wav |
| `es/vaca.wav` | vaca | Millars / Millars | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Millars-vaca.wav |
| `en/duck.wav` | duck | Nattes à chat / Nattes à chat | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Nattes_%C3%A0_chat-duck.wav |
| `en/train.wav` | train | Nattes à chat / Nattes à chat | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Nattes_%C3%A0_chat-train.wav |
| `en/fish.wav` | fish | Exilexi / Exilexi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q150_(eng)-Exilexi-fish.wav |
| `en/dog.wav` | dog | Exilexi / Exilexi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q150_(eng)-Exilexi-dog.wav |
| `en/sun.wav` | sun | Exilexi / Exilexi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q150_(eng)-Exilexi-sun.wav |
| `en/moon.wav` | moon | Exilexi / Exilexi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q150_(eng)-Exilexi-moon.wav |
| `en/water.wav` | water | Exilexi / Exilexi | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q150_(eng)-Exilexi-water.wav |
| `en/car.wav` | car | Back ache / Back ache | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-car.wav |
| `en/boat.wav` | boat | Back ache / Back ache | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-boat.wav |
| `en/cat.wav` | cat | Adélaïde Calais WMFr / Adélaïde Calais WMFr | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Ad%C3%A9la%C3%AFde_Calais_WMFr-cat.wav | 

## mic-es.wav

`mic-es.wav` is `es/gato.wav` (same author and license as listed above) with 3 s of silence before and after, used as the fake microphone of `tests/e2e/reconocedor.spec.ts`.

## mic-en.wav

`mic-en.wav` is `en/cat.wav` (same author and license as listed above) with 3 s of silence before and after, used as the fake microphone of `tests/e2e/reconocedor-en.spec.ts`.
