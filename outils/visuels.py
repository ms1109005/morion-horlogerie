"""Liste des visuels déposés dans img/ et video/, pour le site MORION.

Le site ne demande jamais un fichier absent : il lit js/data/visuels-presents.js, généré ici.
Déposer un fichier au bon nom (extension libre parmi celles ci-dessous) suffit : serve.py
relance ce script à chaque chargement de page.

    python outils/visuels.py              régénère la liste
    python outils/visuels.py --optimiser  convertit les images lourdes en WebP (2000 px max)
                                          et range les originaux dans _sources/visuels-originaux/
"""

import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIERS = {"img": (".webp", ".jpg", ".jpeg", ".png", ".avif"), "video": (".mp4", ".webm")}
SORTIE = os.path.join(ROOT, "js", "data", "visuels-presents.js")


def lister():
    """{ nom sans extension : chemin relatif } ; WebP et MP4 prioritaires si doublon."""
    presents = {}
    for dossier, extensions in DOSSIERS.items():
        base = os.path.join(ROOT, dossier)
        if not os.path.isdir(base):
            continue
        for nom in sorted(os.listdir(base)):
            racine, ext = os.path.splitext(nom)
            if ext.lower() not in extensions or racine.startswith("."):
                continue
            actuel = presents.get(racine)
            if actuel and extensions.index(os.path.splitext(actuel)[1].lower()) <= extensions.index(ext.lower()):
                continue
            presents[racine] = f"{dossier}/{nom}"
    return presents


def ecrire():
    presents = lister()
    texte = (
        "// Généré par outils/visuels.py (relancé par serve.py) : ne pas éditer à la main.\n"
        "// Visuels réellement déposés dans img/ et video/, par nom de fichier sans extension.\n"
        f"export const PRESENTS = {json.dumps(presents, indent=2, ensure_ascii=False)};\n"
    )
    ancien = open(SORTIE, encoding="utf-8").read() if os.path.exists(SORTIE) else ""
    if texte != ancien:
        os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
        with open(SORTIE, "w", encoding="utf-8", newline="\n") as f:
            f.write(texte)
    return presents


def optimiser():
    from PIL import Image  # facultatif : seulement pour --optimiser

    base = os.path.join(ROOT, "img")
    rangement = os.path.join(ROOT, "_sources", "visuels-originaux")
    for nom in sorted(os.listdir(base)) if os.path.isdir(base) else []:
        racine, ext = os.path.splitext(nom)
        chemin = os.path.join(base, nom)
        if ext.lower() not in (".jpg", ".jpeg", ".png") or os.path.getsize(chemin) < 400_000:
            continue
        with Image.open(chemin) as im:
            im = im.convert("RGB")
            im.thumbnail((2000, 2000))
            im.save(os.path.join(base, racine + ".webp"), "WEBP", quality=82, method=6)
        os.makedirs(rangement, exist_ok=True)
        shutil.move(chemin, os.path.join(rangement, nom))
        print(f"{nom} -> {racine}.webp (original dans _sources/visuels-originaux/)")


if __name__ == "__main__":
    if "--optimiser" in sys.argv:
        optimiser()
    trouves = ecrire()
    print(f"{len(trouves)} visuel(s) présent(s) : {', '.join(sorted(trouves)) or 'aucun'}")
