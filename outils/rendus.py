"""Vignettes WebP des 12 références, dérivées des rendus 3D détourés.

Source : _sources/rendus-3d/mor-<famille>-<finition>-trois-quarts.png (2048 px, transparents),
exportés par studio.html?export=rendus. Sortie : img/rendus/mor-<famille>-<finition>.webp
(800 px, transparence conservée), utilisées comme vignettes (grille, panier, récapitulatif,
chapitres en mouvement réduit).

    python outils/rendus.py
"""
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "_sources" / "rendus-3d"
SORTIE = RACINE / "img" / "rendus"
TAILLE = 800


def main() -> int:
    SORTIE.mkdir(parents=True, exist_ok=True)
    fichiers = sorted(SOURCE.glob("mor-*-trois-quarts.png"))
    if not fichiers:
        print(f"Aucun rendu dans {SOURCE}. Lancer studio.html?export=rendus d'abord.")
        return 1
    for src in fichiers:
        nom = src.name.replace("-trois-quarts.png", ".webp")
        with Image.open(src) as im:
            im = im.convert("RGBA")
            boite = im.getbbox()  # cadrage sur la montre, sans la marge transparente
            if boite:
                im = im.crop(boite)
            cote = max(im.size)
            carre = Image.new("RGBA", (cote, cote), (0, 0, 0, 0))
            carre.paste(im, ((cote - im.width) // 2, (cote - im.height) // 2))
            carre = carre.resize((TAILLE, TAILLE), Image.LANCZOS)
            carre.save(SORTIE / nom, "WEBP", quality=88, method=6)
        print(f"{nom} : {(SORTIE / nom).stat().st_size // 1024} ko")
    print(f"{len(fichiers)} vignettes écrites dans {SORTIE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
