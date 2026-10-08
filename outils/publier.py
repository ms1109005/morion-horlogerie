"""Prépare le dossier _publie/ : uniquement les fichiers servis par le site MORION.

Le dépôt contient aussi 85 Mo de fichiers de travail (_sources/, docs/, tests/, outils/) qui
n'ont rien à faire en ligne. Netlify publie _publie/ (voir netlify.toml).

    python3 outils/publier.py      puis    netlify deploy --dir=_publie --prod
"""

import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import visuels  # noqa: E402  liste des images et vidéos déposées, tenue à jour avant publication

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(ROOT, "_publie")
FICHIERS = ["index.html", "404.html", "_redirects"]
DOSSIERS = ["css", "js", "img", "video"]


def publier():
    visuels.ecrire()
    if os.path.isdir(SORTIE):
        shutil.rmtree(SORTIE)
    os.makedirs(SORTIE)
    for nom in FICHIERS:
        shutil.copy2(os.path.join(ROOT, nom), os.path.join(SORTIE, nom))
    ignorer = shutil.ignore_patterns(".*", "__pycache__")
    for nom in DOSSIERS:
        shutil.copytree(os.path.join(ROOT, nom), os.path.join(SORTIE, nom), ignore=ignorer)
    taille = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(SORTIE) for f in fs)
    print(f"_publie/ prêt : {taille / 1e6:.1f} Mo")


if __name__ == "__main__":
    publier()
