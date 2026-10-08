"""Serveur local du site MORION.

- Repli SPA : une route sans extension qui n'existe pas sur le disque
  (/collection, /montre/MOR-PR42-OR...) renvoie index.html.
- Requetes Range (videos scrubbees au scroll), que `python -m http.server` ignore.
- Pas de cache : les modules JS modifies sont toujours relus.

    python serve.py            puis http://127.0.0.1:8781/studio.html
"""

import http.server
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "outils"))
import visuels  # noqa: E402  liste des images et vidéos déposées

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8781
# Rendus 3D exportés par studio.html?export=rendus (références pour Imagen 3).
EXPORT_DIR = os.path.join(ROOT, "_sources", "rendus-3d")
EXPORT_NAME = re.compile(r"^[a-z0-9-]+\.png$")


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        # Réception des rendus exportés par le studio, depuis ce poste uniquement.
        if not self.path.startswith("/__rendus/") or self.client_address[0] != "127.0.0.1":
            return self.send_error(404)
        name = self.path[len("/__rendus/"):]
        size = int(self.headers.get("Content-Length") or 0)
        if not EXPORT_NAME.match(name):
            return self.send_error(400, "Nom invalide")
        if size <= 0 or size > 25_000_000:
            return self.send_error(413)
        os.makedirs(EXPORT_DIR, exist_ok=True)
        with open(os.path.join(EXPORT_DIR, name), "wb") as f:
            f.write(self.rfile.read(size))
        self.send_response(201)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _spa_fallback(self):
        path = self.translate_path(self.path)
        clean = self.path.split("?", 1)[0].split("#", 1)[0]
        if clean.endswith("/js/data/visuels-presents.js"):
            visuels.ecrire()  # un fichier déposé dans img/ ou video/ s'affiche au rechargement
        if os.path.exists(path) or os.path.splitext(clean)[1]:
            return
        for shell in ("index.html", "studio.html"):
            if os.path.exists(os.path.join(ROOT, shell)):
                self.path = "/" + shell
                return

    def send_head(self):
        self._spa_fallback()
        self._remaining = None
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or os.path.isdir(path):
            return super().send_head()
        match = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
        if not match:
            return super().send_head()
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "Fichier introuvable")
            return None
        size = os.fstat(f.fileno()).st_size
        first, last = match.groups()
        if first:
            start = int(first)
            end = min(int(last), size - 1) if last else size - 1
        else:
            start = max(0, size - int(last or 0))
            end = size - 1
        if start > end or start >= size:
            f.close()
            self.send_error(416, "Plage invalide")
            return None
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        f.seek(start)
        self._remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_remaining", None)
        try:
            if remaining is None:
                return super().copyfile(source, outputfile)
            while remaining > 0:
                chunk = source.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass


if __name__ == "__main__":
    visuels.ecrire()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("MORION sur http://127.0.0.1:%d/" % PORT)
    server.serve_forever()
