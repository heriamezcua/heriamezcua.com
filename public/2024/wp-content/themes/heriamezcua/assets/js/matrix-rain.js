var animationInterval = null;
var c = null;
var ctx = null;
var drops = [];
var font_size = 10;
var matrix = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん１２３４５６７８９＠＃＄％＾＆＊（）＊＆＾％＋－／～｛［｜｀］｝".split("");

// Función para inicializar el canvas y la animación
function initCanvas() {
    if (!c) {
        c = document.createElement("canvas");
        c.id = "c";
        document.body.appendChild(c);
        ctx = c.getContext("2d");
    }

    resizeCanvas(); // Ajustar tamaño y recalcular columnas

    if (!animationInterval) {
        animationInterval = setInterval(draw, 35);
    }
}

// Función para ajustar el tamaño del canvas dinámicamente
function resizeCanvas() {
    if (!c) return; // No hacer nada si el canvas aún no existe

    c.width = window.innerWidth;
    c.height = window.innerHeight;

    var columns = c.width / font_size;
    drops = [];
    for (var x = 0; x < columns; x++) {
        drops[x] = Math.floor(Math.random() * (c.height / font_size));
    }
}

// Función para dibujar la animación
function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#23e9ad";
    ctx.font = font_size + "px arial";

    for (var i = 0; i < drops.length; i++) {
        var text = matrix[Math.floor(Math.random() * matrix.length)];
        ctx.fillText(text, i * font_size, drops[i] * font_size);

        if (drops[i] * font_size > c.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

// Evento para iniciar la animación al hacer clic en "Open"
document.querySelector(".text-menu").addEventListener("click", function () {
    initCanvas();
});

// Evento para redimensionar el canvas al cambiar el tamaño de la ventana
window.addEventListener("resize", resizeCanvas);