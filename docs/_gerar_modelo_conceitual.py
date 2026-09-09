"""Gera o PNG do modelo conceitual UML do EstudaAI."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).with_name("modelo-conceitual.png")
W, H = 2560, 1560

BG = "#F4F6FA"
PAPER = "#FFFFFF"
INK = "#0F172A"
MUTED = "#334155"
LINE = "#1E293B"
RULE = "#CBD5E1"

PALETTE = {
    "ator": "#1E3A8A",
    "catalogo": "#0F766E",
    "progresso": "#B45309",
    "ia": "#6D28D9",
}


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


F_TITLE = font(38, bold=True)
F_SUB = font(16)
F_CLASS = font(18, bold=True)
F_STEREO = font(12, italic=True)
F_ATTR = font(15)
F_REL = font(14, italic=True)
F_MULT = font(14, bold=True)
F_NOTE = font(14)
F_LEG = font(15)
F_H2 = font(17, bold=True)


def measure(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


@dataclass
class Box:
    name: str
    x: int
    y: int
    w: int
    attrs: list[str] = field(default_factory=list)
    stereo: str | None = None
    kind: str = "ator"
    h: int = 0

    def __post_init__(self) -> None:
        header = 48 if not self.stereo else 62
        body = 16 + 22 * max(len(self.attrs), 1)
        self.h = header + body

    @property
    def cx(self) -> float:
        return self.x + self.w / 2

    @property
    def cy(self) -> float:
        return self.y + self.h / 2

    @property
    def r(self) -> int:
        return self.x + self.w

    @property
    def b(self) -> int:
        return self.y + self.h

    def side(self, name: str) -> tuple[float, float]:
        table = {
            "top": (self.cx, self.y),
            "bottom": (self.cx, self.b),
            "left": (self.x, self.cy),
            "right": (self.r, self.cy),
            "top-left": (self.x + 40, self.y),
            "top-right": (self.r - 40, self.y),
            "bottom-left": (self.x + 48, self.b),
            "bottom-right": (self.r - 48, self.b),
            "left-top": (self.x, self.y + 24),
            "left-bottom": (self.x, self.b - 24),
            "right-top": (self.r, self.y + 24),
            "right-bottom": (self.r, self.b - 24),
        }
        return table[name]


def draw_box(draw: ImageDraw.ImageDraw, box: Box) -> None:
    color = PALETTE[box.kind]
    header = 48 if not box.stereo else 62
    draw.rounded_rectangle([box.x, box.y, box.r, box.b], radius=10, fill=PAPER, outline=color, width=2)
    draw.rounded_rectangle([box.x, box.y, box.r, box.y + header + 10], radius=10, fill=color, outline=color, width=2)
    draw.rectangle([box.x, box.y + header - 8, box.r, box.y + header], fill=color)
    tw, _ = measure(draw, box.name, F_CLASS)
    name_y = box.y + (12 if not box.stereo else 28)
    draw.text((box.cx - tw / 2, name_y), box.name, font=F_CLASS, fill=PAPER)
    if box.stereo:
        st = f"«{box.stereo}»"
        sw, _ = measure(draw, st, F_STEREO)
        draw.text((box.cx - sw / 2, box.y + 8), st, font=F_STEREO, fill="#E0E7FF")
    ay = box.y + header + 12
    for attr in box.attrs:
        draw.text((box.x + 16, ay), attr, font=F_ATTR, fill=INK)
        ay += 22


def poly(draw: ImageDraw.ImageDraw, pts: list[tuple[float, float]]) -> None:
    draw.line([(round(x), round(y)) for x, y in pts], fill=LINE, width=2, joint="curve")


def caption(draw: ImageDraw.ImageDraw, x: float, y: float, text: str, fnt, fill=MUTED) -> None:
    tw, th = measure(draw, text, fnt)
    draw.rounded_rectangle(
        [x - tw / 2 - 5, y - th / 2 - 3, x + tw / 2 + 5, y + th / 2 + 3],
        radius=4,
        fill=BG,
    )
    draw.text((x - tw / 2, y - th / 2 - 1), text, font=fnt, fill=fill)


def mult(draw: ImageDraw.ImageDraw, x: float, y: float, text: str) -> None:
    draw.text((x, y), text, font=F_MULT, fill=INK)


def triangle_up(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    pts = [(x, y), (x - 12, y + 20), (x + 12, y + 20)]
    draw.polygon(pts, fill=PAPER, outline=LINE)
    draw.line(pts + [pts[0]], fill=LINE, width=2)


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    title = "EstudaAI — Modelo Conceitual"
    tw, _ = measure(draw, title, F_TITLE)
    draw.text(((W - tw) / 2, 24), title, font=F_TITLE, fill=INK)
    sub = "Diagrama de classes do domínio  ·  visão do produto, requisitos funcionais, regras de negócio e personas"
    sw, _ = measure(draw, sub, F_SUB)
    draw.text(((W - sw) / 2, 72), sub, font=F_SUB, fill=MUTED)

    items = [
        ("ator", "Atores"),
        ("catalogo", "Catálogo de aprendizagem"),
        ("progresso", "Progresso do aluno"),
        ("ia", "Apoio por LLM"),
    ]
    lx = 620
    for key, label in items:
        draw.rounded_rectangle([lx, 108, lx + 16, 124], radius=3, fill=PALETTE[key])
        draw.text((lx + 24, 104), label, font=F_LEG, fill=INK)
        lw, _ = measure(draw, label, F_LEG)
        lx += 24 + lw + 32

    usuario = Box("Usuario", 1110, 155, 340, ["nome", "email", "senha"], kind="ator")
    aluno = Box("Aluno", 500, 370, 260, stereo="especialização", kind="ator")
    admin = Box("Administrador", 1960, 370, 290, stereo="especialização", kind="ator")

    solicitacao = Box(
        "SolicitacaoTrilha",
        80,
        560,
        340,
        ["textoObjetivo", "respostaLLM", "dataSolicitacao"],
        kind="ia",
    )
    progresso = Box(
        "Progresso",
        480,
        560,
        330,
        ["dataInicio", "ativo", "/percentualProgresso"],
        kind="progresso",
    )
    trilha = Box(
        "Trilha",
        1110,
        560,
        340,
        ["titulo", "descricao", "tipo"],
        kind="catalogo",
    )
    categoria = Box("Categoria", 1960, 560, 290, ["nome", "descricao"], kind="catalogo")

    mensagem = Box(
        "Mensagem",
        80,
        940,
        340,
        ["texto", "dataEnvio", "origem"],
        kind="ia",
    )
    conclusao = Box("ConclusaoEtapa", 480, 940, 330, ["dataConclusao"], kind="progresso")
    etapa = Box("Etapa", 1110, 940, 340, ["titulo", "conteudo", "ordem"], kind="catalogo")

    for box in (
        usuario,
        aluno,
        admin,
        solicitacao,
        progresso,
        trilha,
        categoria,
        mensagem,
        conclusao,
        etapa,
    ):
        draw_box(draw, box)

    # Generalização
    tip = usuario.side("bottom")
    jy = 330
    triangle_up(draw, tip[0], tip[1])
    poly(draw, [(tip[0], tip[1] + 20), (tip[0], jy)])
    poly(draw, [(aluno.cx, jy), (admin.cx, jy)])
    poly(draw, [(aluno.cx, jy), aluno.side("top")])
    poly(draw, [(admin.cx, jy), admin.side("top")])
    caption(draw, usuario.cx + 78, jy, "especializa", F_REL)

    # Aluno 1 — realiza — 0..* Progresso
    poly(draw, [aluno.side("bottom"), progresso.side("top")])
    mult(draw, aluno.cx + 10, aluno.b + 4, "1")
    mult(draw, progresso.cx + 10, progresso.y - 22, "0..*")
    caption(draw, aluno.cx + 70, (aluno.b + progresso.y) / 2, "realiza", F_REL)

    # Aluno 1 — solicita — 0..* SolicitacaoTrilha
    a = aluno.side("left-bottom")
    s = solicitacao.side("top-right")
    poly(draw, [a, (a[0], 500), (s[0], 500), s])
    mult(draw, a[0] + 8, a[1] - 22, "1")
    mult(draw, s[0] - 36, 478, "0..*")
    caption(draw, (a[0] + s[0]) / 2, 484, "solicita", F_REL)

    # Aluno 1 — envia — 0..* Mensagem  (margem esquerda, longe de Solicitacao)
    al = aluno.side("left-top")
    mt = mensagem.side("left-top")
    poly(draw, [al, (48, al[1]), (48, mt[1]), mt])
    mult(draw, 54, al[1] - 22, "1")
    mult(draw, 54, mt[1] - 22, "0..*")
    caption(draw, 48, (al[1] + mt[1]) / 2, "envia", F_REL)

    # Solicitacao 0..1 — origina — 1 Trilha
    sr = solicitacao.side("right-top")
    tl = trilha.side("left-top")
    poly(draw, [sr, (sr[0] + 24, sr[1]), (sr[0] + 24, 528), (tl[0] - 24, 528), (tl[0] - 24, tl[1]), tl])
    mult(draw, sr[0] - 52, sr[1] - 26, "0..1")
    mult(draw, tl[0] - 18, 504, "1")
    caption(draw, 990, 510, "origina", F_REL)

    # Progresso 1 — acompanha — 1 Trilha
    poly(draw, [progresso.side("right"), trilha.side("left")])
    mult(draw, progresso.r + 8, progresso.cy - 24, "1")
    mult(draw, trilha.x - 22, trilha.cy - 24, "1")
    caption(draw, (progresso.r + trilha.x) / 2, progresso.cy - 18, "acompanha", F_REL)

    # Progresso 1 — registra — 0..* ConclusaoEtapa
    poly(draw, [progresso.side("bottom"), conclusao.side("top")])
    mult(draw, progresso.cx + 10, progresso.b + 4, "1")
    mult(draw, conclusao.cx + 10, conclusao.y - 22, "0..*")
    caption(draw, progresso.cx + 78, (progresso.b + conclusao.y) / 2, "registra", F_REL)

    # Categoria 1 — classifica — 1..* Trilha
    poly(draw, [categoria.side("left"), trilha.side("right")])
    mult(draw, categoria.x - 28, categoria.cy - 24, "1")
    mult(draw, trilha.r + 8, trilha.cy - 24, "1..*")
    caption(draw, (trilha.r + categoria.x) / 2, trilha.cy - 18, "classifica", F_REL)

    # Trilha 1 — composta por — 1..* Etapa
    poly(draw, [trilha.side("bottom"), etapa.side("top")])
    mult(draw, trilha.cx + 10, trilha.b + 4, "1")
    mult(draw, etapa.cx + 10, etapa.y - 22, "1..*")
    caption(draw, trilha.cx + 92, (trilha.b + etapa.y) / 2, "composta por", F_REL)

    # ConclusaoEtapa 1 — conclui — 1 Etapa
    poly(draw, [conclusao.side("right"), etapa.side("left")])
    mult(draw, conclusao.r + 8, conclusao.cy - 24, "1")
    mult(draw, etapa.x - 18, etapa.cy - 24, "1")
    caption(draw, (conclusao.r + etapa.x) / 2, conclusao.cy - 18, "conclui", F_REL)

    # Nota do administrador
    nx, ny, nw, nh = 1760, 940, 490, 118
    draw.rounded_rectangle([nx, ny, nx + nw, ny + nh], radius=8, fill="#FFFBEB", outline="#D97706", width=1)
    note = (
        "Nota — Administrador\n"
        "Gerencia Categoria, Trilha pré-definida e Etapa\n"
        "(RF09–RF12, RB02, RB07). É restrição de\n"
        "permissão, não associação estrutural."
    )
    draw.text((nx + 16, ny + 12), note, font=F_NOTE, fill="#78350F")

    # Tipos
    tx, ty = 1760, 1080
    draw.rounded_rectangle([tx, ty, tx + 490, ty + 110], radius=8, fill=PAPER, outline=RULE, width=1)
    draw.text((tx + 16, ty + 10), "Valores de domínio", font=font(15, bold=True), fill=INK)
    draw.text((tx + 16, ty + 36), "Trilha.tipo  ∈  { pré-definida , personalizada }", font=F_NOTE, fill=MUTED)
    draw.text((tx + 16, ty + 58), "Mensagem.origem  ∈  { aluno , agente LLM }", font=F_NOTE, fill=MUTED)
    draw.text((tx + 16, ty + 80), "Mensagem refere-se a 0..1 Trilha (RF08).", font=F_NOTE, fill=MUTED)

    constraints = [
        "RB03  Toda Trilha possui exatamente uma Categoria e uma ou mais Etapas ordenadas pela ordem de sequência.",
        "RB04 / RB06  O Progresso é individual por aluno e o percentual é atributo derivado (etapas concluídas ÷ total de etapas).",
        "RB05 / RB12  A Etapa só entra no cálculo se o aluno marcar ConclusaoEtapa; o histórico permanece enquanto o Progresso estiver ativo.",
        "RB08 / RB09  A Trilha personalizada nasce da SolicitacaoTrilha (texto do aluno + resposta do LLM) e fica associada a esse aluno.",
        "RB01 / RB02  Seleção, criação e progresso exigem autenticação; a manutenção do catálogo é exclusiva do Administrador.",
    ]
    draw.rounded_rectangle([80, 1236, 2480, 1516], radius=12, fill=PAPER, outline=RULE, width=1)
    draw.text((104, 1254), "Restrições do domínio (regras de negócio)", font=F_H2, fill=INK)
    cy = 1292
    for line in constraints:
        draw.ellipse([110, cy + 7, 122, cy + 19], fill=PALETTE["catalogo"])
        draw.text((134, cy), line, font=F_NOTE, fill=MUTED)
        cy += 40

    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes) {img.size}")


if __name__ == "__main__":
    main()
