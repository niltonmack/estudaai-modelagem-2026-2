"""Gera os PNG dos diagramas de caso de uso do EstudaAI (aluno e administrador)."""

from __future__ import annotations

from math import hypot
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DOCS = Path(__file__).resolve().parent
BG = "#F4F6FA"
PAPER = "#FFFFFF"
INK = "#0F172A"
MUTED = "#334155"
LINE = "#1E293B"
RULE = "#CBD5E1"
BLUE = "#1E3A8A"
TEAL = "#0F766E"
PURPLE = "#6D28D9"
AMBER = "#B45309"


def font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont:
    base = Path(r"C:\Windows\Fonts")
    if bold:
        names = ["segoeuib.ttf", "arialbd.ttf"]
    elif italic:
        names = ["segoeuii.ttf", "ariali.ttf"]
    else:
        names = ["segoeui.ttf", "arial.ttf"]
    for name in names:
        path = base / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


F_TITLE = font(34, bold=True)
F_SUB = font(15)
F_SYS = font(16, bold=True)
F_UC = font(15, bold=True)
F_ACTOR = font(16, bold=True)
F_STEREO = font(13, italic=True)
F_NOTE = font(13)
F_LEG = font(14)


def measure(draw: ImageDraw.ImageDraw, text: str, fnt) -> tuple[int, int]:
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for word in words:
        trial = (cur + " " + word).strip()
        tw, _ = measure(draw, trial, fnt)
        if tw <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines or [text]


def dashed(draw: ImageDraw.ImageDraw, p1, p2, color=LINE, width=2, dash=9, gap=7) -> None:
    x1, y1 = p1
    x2, y2 = p2
    dist = hypot(x2 - x1, y2 - y1)
    if dist == 0:
        return
    ux, uy = (x2 - x1) / dist, (y2 - y1) / dist
    t = 0.0
    while t < dist:
        t2 = min(t + dash, dist)
        draw.line(
            [(round(x1 + ux * t), round(y1 + uy * t)), (round(x1 + ux * t2), round(y1 + uy * t2))],
            fill=color,
            width=width,
        )
        t = t2 + gap


def arrow_head(draw: ImageDraw.ImageDraw, tip, src, color=LINE, size=11) -> None:
    tx, ty = tip
    sx, sy = src
    dist = hypot(tx - sx, ty - sy) or 1
    ux, uy = (tx - sx) / dist, (ty - sy) / dist
    left = (tx - ux * size - uy * size * 0.55, ty - uy * size + ux * size * 0.55)
    right = (tx - ux * size + uy * size * 0.55, ty - uy * size - ux * size * 0.55)
    draw.polygon([tip, left, right], fill=color)


def ellipse_edge(cx, cy, w, h, ox, oy) -> tuple[float, float]:
    dx, dy = ox - cx, oy - cy
    if dx == 0 and dy == 0:
        return cx, cy
    a, b = w / 2, h / 2
    mag = hypot(dx / a, dy / b) or 1
    return cx + dx / mag, cy + dy / mag


class Oval:
    def __init__(self, cx, cy, w, h, text, color, emphasis=False):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h
        self.text, self.color, self.emphasis = text, color, emphasis

    def edge_to(self, x, y):
        return ellipse_edge(self.cx, self.cy, self.w, self.h, x, y)


def draw_oval(draw: ImageDraw.ImageDraw, o: Oval) -> None:
    x0, y0 = o.cx - o.w / 2, o.cy - o.h / 2
    fill = "#EEF2FF" if o.emphasis else PAPER
    draw.ellipse([x0, y0, x0 + o.w, y0 + o.h], fill=fill, outline=o.color, width=4 if o.emphasis else 2)
    lines = wrap(draw, o.text, F_UC, int(o.w * 0.78))
    total_h = len(lines) * 20
    y = o.cy - total_h / 2 - 1
    for line in lines:
        tw, _ = measure(draw, line, F_UC)
        draw.text((o.cx - tw / 2, y), line, font=F_UC, fill=INK)
        y += 20


def stick(draw: ImageDraw.ImageDraw, cx: int, top: int, label: str, color: str, role: str | None = None) -> tuple[int, int]:
    r = 24
    draw.ellipse([cx - r, top, cx + r, top + 2 * r], outline=color, width=3)
    body = top + 2 * r
    hip = body + 58
    draw.line([(cx, body), (cx, hip)], fill=color, width=3)
    draw.line([(cx - 36, body + 16), (cx + 36, body + 16)], fill=color, width=3)
    draw.line([(cx, hip), (cx - 30, hip + 42)], fill=color, width=3)
    draw.line([(cx, hip), (cx + 30, hip + 42)], fill=color, width=3)
    tw, _ = measure(draw, label, F_ACTOR)
    draw.text((cx - tw / 2, hip + 50), label, font=F_ACTOR, fill=color)
    if role:
        rw, _ = measure(draw, role, F_NOTE)
        draw.text((cx - rw / 2, hip + 74), role, font=F_NOTE, fill=MUTED)
    return cx, body + 16


def assoc(draw, actor_pt, oval: Oval, color=LINE) -> None:
    ex, ey = oval.edge_to(*actor_pt)
    draw.line([actor_pt, (ex, ey)], fill=color, width=2)


def include_rel(draw, base: Oval, included: Oval, label_at=0.45, dy=-12) -> None:
    p1 = base.edge_to(included.cx, included.cy)
    p2 = included.edge_to(base.cx, base.cy)
    dashed(draw, p1, p2)
    arrow_head(draw, p2, p1)
    mx = p1[0] + (p2[0] - p1[0]) * label_at
    my = p1[1] + (p2[1] - p1[1]) * label_at + dy
    caption(draw, mx, my, "«include»")


def extend_rel(draw, extension: Oval, base: Oval, label_at=0.5, dy=-12) -> None:
    p1 = extension.edge_to(base.cx, base.cy)
    p2 = base.edge_to(extension.cx, extension.cy)
    dashed(draw, p1, p2, color=AMBER)
    arrow_head(draw, p2, p1, color=AMBER)
    mx = p1[0] + (p2[0] - p1[0]) * label_at
    my = p1[1] + (p2[1] - p1[1]) * label_at + dy
    caption(draw, mx, my, "«extend»", fill=AMBER)


def caption(draw, x, y, text, fill=MUTED) -> None:
    tw, th = measure(draw, text, F_STEREO)
    draw.rounded_rectangle([x - tw / 2 - 5, y - th / 2 - 3, x + tw / 2 + 5, y + th / 2 + 3], radius=4, fill=BG)
    draw.text((x - tw / 2, y - th / 2 - 1), text, font=F_STEREO, fill=fill)


def legend(draw, x, y) -> None:
    draw.line([(x, y), (x + 36, y)], fill=LINE, width=2)
    draw.text((x + 44, y - 10), "associação", font=F_LEG, fill=INK)
    dashed(draw, (x + 180, y), (x + 216, y))
    draw.text((x + 224, y - 10), "«include»  (obrigatório)", font=F_LEG, fill=INK)
    dashed(draw, (x + 470, y), (x + 506, y), color=AMBER)
    draw.text((x + 514, y - 10), "«extend»  (opcional)", font=F_LEG, fill=AMBER)


def header(draw, w, title, sub) -> None:
    tw, _ = measure(draw, title, F_TITLE)
    draw.text(((w - tw) / 2, 22), title, font=F_TITLE, fill=INK)
    sw, _ = measure(draw, sub, F_SUB)
    draw.text(((w - sw) / 2, 66), sub, font=F_SUB, fill=MUTED)


def system_box(draw, box, name, color) -> None:
    x, y, w, h = box
    draw.rounded_rectangle([x, y, x + w, y + h], radius=14, outline=color, width=2)
    nw, _ = measure(draw, name, F_SYS)
    draw.rectangle([x + 18, y - 2, x + 28 + nw, y + 28], fill=BG)
    draw.text((x + 24, y + 2), name, font=F_SYS, fill=color)


def aluno_png() -> None:
    w, h = 2360, 1420
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    header(
        draw,
        w,
        "UC01 — Caso de uso do aluno",
        "EstudaAI  ·  Acompanhar trilha de aprendizagem  ·  baseado no modelo conceitual, RF01–RF08 e RB01/RB04–RB10",
    )
    legend(draw, 720, 118)
    system_box(draw, (430, 160, 1500, 1120), "EstudaAI", BLUE)

    color = BLUE
    autenticar = Oval(1180, 290, 340, 96, "Autenticar usuário", color)
    main = Oval(1180, 620, 460, 128, "Acompanhar trilha de aprendizagem", color, emphasis=True)
    escolher = Oval(700, 430, 360, 110, "Escolher trilha pré-definida", color)
    criar = Oval(1660, 430, 360, 110, "Criar trilha personalizada", PURPLE)
    progresso = Oval(760, 920, 380, 110, "Registrar conclusão e progresso", AMBER)
    conversar = Oval(1600, 920, 380, 110, "Conversar com o agente LLM", PURPLE)

    for o in (autenticar, main, escolher, criar, progresso, conversar):
        draw_oval(draw, o)

    include_rel(draw, main, autenticar, label_at=0.52, dy=0)
    extend_rel(draw, escolher, main, label_at=0.45, dy=-16)
    extend_rel(draw, criar, main, label_at=0.45, dy=-16)
    include_rel(draw, main, progresso, label_at=0.42, dy=14)
    extend_rel(draw, conversar, main, label_at=0.48, dy=14)

    ax, ay = stick(draw, 190, 530, "Aluno", BLUE, "ator primário")
    assoc(draw, (ax + 36, ay), main, BLUE)

    lx, ly = stick(draw, 2170, 400, "Agente LLM", PURPLE, "ator secundário")
    assoc(draw, (lx - 36, ly), criar, PURPLE)
    assoc(draw, (lx - 36, ly + 120), conversar, PURPLE)

    note = (
        "Ponto de extensão 1: o aluno descreve um objetivo em linguagem natural → Criar trilha personalizada.\n"
        "Ponto de extensão 2: o aluno pede dúvida ou sugestão → Conversar com o agente LLM.\n"
        "Inclusões: autenticação (RB01) e registro de ConclusaoEtapa / Progresso (RB04, RB05, RB06)."
    )
    draw.rounded_rectangle([450, 1120, 1890, 1248], radius=10, fill=PAPER, outline=RULE, width=1)
    draw.text((470, 1136), note, font=F_NOTE, fill=MUTED)

    img.save(DOCS / "caso-uso-aluno.png", "PNG", optimize=True)
    print("aluno", (DOCS / "caso-uso-aluno.png").stat().st_size)


def admin_png() -> None:
    w, h = 2360, 1420
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    header(
        draw,
        w,
        "UC02 — Caso de uso do administrador",
        "EstudaAI  ·  Manter catálogo de aprendizagem  ·  baseado no modelo conceitual, RF09–RF12 e RB02/RB03/RB07/RB11",
    )
    legend(draw, 720, 118)
    system_box(draw, (430, 160, 1500, 1120), "EstudaAI", TEAL)

    autenticar = Oval(1180, 290, 340, 96, "Autenticar usuário", TEAL)
    main = Oval(1180, 620, 460, 128, "Manter catálogo de aprendizagem", TEAL, emphasis=True)
    cat = Oval(700, 430, 340, 110, "Gerenciar categorias", TEAL)
    trilhas = Oval(1660, 430, 360, 110, "Gerenciar trilhas pré-definidas", TEAL)
    etapas = Oval(700, 900, 340, 110, "Gerenciar etapas", TEAL)
    associar = Oval(1180, 1030, 400, 110, "Associar etapas e definir sequência", TEAL)
    impacto = Oval(1660, 900, 360, 110, "Avaliar impacto da remoção", AMBER)

    for o in (autenticar, main, cat, trilhas, etapas, associar, impacto):
        draw_oval(draw, o)

    include_rel(draw, main, autenticar, label_at=0.52, dy=0)
    include_rel(draw, main, cat, label_at=0.4, dy=-16)
    include_rel(draw, main, trilhas, label_at=0.4, dy=-16)
    include_rel(draw, main, etapas, label_at=0.4, dy=14)
    include_rel(draw, main, associar, label_at=0.5, dy=0)
    extend_rel(draw, impacto, etapas, label_at=0.5, dy=-16)

    ax, ay = stick(draw, 190, 530, "Administrador", TEAL, "ator primário")
    assoc(draw, (ax + 40, ay), main, TEAL)

    note = (
        "Inclusões obrigatórias: autenticação com perfil administrador (RB02) e manutenção de Categoria, Trilha pré-definida e Etapa.\n"
        "Toda trilha persistida precisa de uma categoria e de uma ou mais etapas ordenadas (RB03, RF12).\n"
        "Ponto de extensão: ao remover etapa vinculada, o sistema trata o impacto sobre Progresso e ConclusaoEtapa (RB11)."
    )
    draw.rounded_rectangle([450, 1120, 1890, 1248], radius=10, fill=PAPER, outline=RULE, width=1)
    draw.text((470, 1136), note, font=F_NOTE, fill=MUTED)

    img.save(DOCS / "caso-uso-admin.png", "PNG", optimize=True)
    print("admin", (DOCS / "caso-uso-admin.png").stat().st_size)


if __name__ == "__main__":
    aluno_png()
    admin_png()
