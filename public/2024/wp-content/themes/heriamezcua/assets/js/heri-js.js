var TextAnimator = (function () {
    function TextAnimator(options) {
        this.letters_to_show = options.letters_to_show || [".", "?"];
        this.containerSelector = options.containerSelector || ".letter";
        this.charCycles = options.charCycles || 20;
        this.charCycleLength = options.charCycleLength || 30;
        this.all_characters = options.all_characters || 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン一二三四五六七八九十百千万'.split('');
        this.current_index = 0;
        this.i = 0;
        this.intervalId = null; // Guardar el ID del intervalo para detenerlo si es necesario
        this.changeInterval = options.changeInterval || 3000; // Intervalo de cambio, por defecto 3 segundos
    }

    TextAnimator.prototype.init = function () {
        this.change_to(this.letters_to_show[this.current_index]);
        this.start_animation();
    };


    TextAnimator.prototype.start_animation = function () {
        var self = this;
        if (this.intervalId) {
            clearInterval(this.intervalId); // Limpia cualquier intervalo previo
        }
        this.intervalId = setInterval(function () {
            self.i = 0;
            self.current_index = (self.current_index + 1) % self.letters_to_show.length;
            self.change_to(self.letters_to_show[self.current_index]);
        }, this.changeInterval); // Usar el intervalo definido en las opciones
    };


    TextAnimator.prototype.change_to = function (chars) {
        var self = this;
        var container = document.querySelector(self.containerSelector);
        if (!container) {
            console.error(`No se encontró el contenedor con el selector: ${self.containerSelector}`);
            return;
        }

        var letters = container.querySelectorAll('.letter');

        // Asegurarse de que el número de spans coincida con el número de caracteres
        if (letters.length !== chars.length) {
            // Limpiar y recrear los spans si es necesario
            container.innerHTML = '';
            for (var i = 0; i < chars.length; i++) {
                var span = document.createElement('span');
                span.className = 'letter';
                span.textContent = chars.charAt(i);
                container.appendChild(span);
            }
            letters = container.querySelectorAll('.letter');
        }

        letters.forEach(function (letter) {
            letter.classList.remove("is-hidden");
        });

        for (var z = chars.length; z < letters.length; z++) {
            letters[z].classList.add("is-hidden");
        }

        if (self.i < self.charCycles) {
            setTimeout(function () {
                self.i++;
                for (var x = 0; x < chars.length; x++) {
                    letters[x].textContent = self.all_characters[Math.floor(Math.random() * self.all_characters.length)];
                }
                self.change_to(chars);
            }, self.charCycleLength);
        } else {
            chars[0] = chars[0].toUpperCase();
            for (var y = 0; y < chars.length; y++) {
                letters[y].textContent = chars.substring(y, y + 1);
            }
        }
    };

    return TextAnimator;
})();

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    const animations = [
        {
            paths: ["/", "/index.html"],
            instances: [
                { selector: ".change-cont-1", letters: [".", "?"], chars: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン一二三四五六七八九十百千万'.split(''), interval: 3000 },
                { selector: ".change-cont-2", letters: ["¡Bienvenido!", "Welcome!", "привет!", "Witaj!", "ようこそ!", "欢迎!", "Willkommen!", "Välkommen!"], chars: ['0', '1'], interval: 4000 },
                { selector: ".sub-1", letters: ["Proyectos Recientes", "Najnowsze Projekty", "最新のプロジェクト", "Latest Projects", "最新项目", "Neueste Projekte", "Последние проекты", "Senaste Projekt"], chars: ['0', '1'], interval: 4000 },
                { selector: ".sub-3", letters: ["Contacto", "Kontakt", "連絡先", "Contact", "联系", "Kontakt", "Контакт", "Kontakt"], chars: ['0', '1'], interval: 4000 }
            ]
        },
        {
            paths: ["/", "/index.html", "/blog"],
            instances: [
                { selector: ".sub-2", letters: ["Posts Recientes", "Najnowsze Posty", "最新の投稿", "Latest Posts", "最新帖子", "Neueste Beiträge", "Последние посты", "Senaste Inlägg"], chars: ['0', '1'], interval: 4000 }
            ]
        },
        {
            paths: ["/blog"],
            instances: [
                { selector: ".blog-featured", letters: ["Post Destacado", "Post wyróżniony", "注目の投稿", "Featured Post", "精选帖子", "Hervorgehobener Beitrag", "Рекомендованные посты", "Utvalt Inlägg"], chars: ['0', '1'], interval: 4000 }
            ]
        },
        {
            paths: ["/about"],
            instances: [
                { selector: ".change-about-1", letters: ["Hola, Amigo!", "Witaj, Przyjacielu!", "こんにちは、友よ！", "Hello, Friend!", "你好，朋友！", "Hallo, Freund!", "Привет, друг!", "Hej, Vän!"], chars: ['0', '1'], interval: 4000 },
                { selector: ".change-about-2", letters: ["Java", "Spring boot", "JUnit5", "Swagger", "OpenApi", "PHP", "Laravel", "Wordpress"], chars: ['0', '1'], interval: 4000 },
                {
                    selector: ".change-about-3", letters: ["Experiencia Laboral", "Doświadczenie Zawodowe", "職務経験", "Work Experience", "工作经验", "Berufserfahrung", "Опыт работы", "Arbetslivserfarenhet"], chars: ['0', '1'], interval: 4000
                }
            ]
        }
    ];

    animations.forEach(({ paths, instances }) => {
        if (paths.some(p => path.startsWith(p))) {
            instances.forEach(({ selector, letters, chars, interval }) => {
                new TextAnimator({
                    letters_to_show: letters,
                    containerSelector: selector,
                    charCycles: 30,
                    charCycleLength: 50,
                    all_characters: chars,
                    changeInterval: interval
                }).init();
            });
        }
    });
});

if (window.location.pathname.startsWith("/")) {
    document.addEventListener("DOMContentLoaded", function () {
        // Dynamic dev icons logo carousel
        const icons = [{
            name: "HTML5",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
        },
        {
            name: "CSS3",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"
        },
        {
            name: "JavaScript",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
        },
        {
            name: "PHP",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg"
        },
        {
            name: "Laravel",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg"
        },
        {
            name: "WordPress",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg"
        },
        {
            name: "Hibernate",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hibernate/hibernate-original.svg"
        },
        {
            name: "JUnit5",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/junit/junit-original.svg"
        },
        {
            name: "OpenApi",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/openapi/openapi-original.svg"
        },
        {
            name: "Swagger",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg"
        },
        {
            name: "Jenkins",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg"
        },
        {
            name: "Spring",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg"
        },
        {
            name: "Java",
            url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg"
        }
        ];

        const container = document.getElementById("scrolling-content");

        function createIcons() {
            container.innerHTML = ""; // Limpiar contenido previo
            icons.forEach(icon => {
                const div = document.createElement("div");
                div.innerHTML = `<img width="200px" height="150px" loading="lazy" src="${icon.url}" alt="${icon.name}" />
                             <p class="moving-cont-text">${icon.name}</p>`;
                container.appendChild(div);
            });

            // Duplicar contenido para efecto infinito
            icons.forEach(icon => {
                const div = document.createElement("div");
                div.innerHTML = `<img width="200px" height="150px" loading="lazy" src="${icon.url}" alt="${icon.name}" />
                             <p class="moving-cont-text">${icon.name}</p>`;
                container.appendChild(div);
            });
        }

        createIcons();

        // The matrix is everywhere carousel
        const bluePill = '<img class="matrix-pills" src="/2024/wp-content/uploads/2025/02/blue-pill.png">';
        const redPill = '<img class="matrix-pills" src="/2024/wp-content/uploads/2025/02/red-pill-removebg.png">';

        const textOptions = [
            `${redPill}<span>&nbsp;</span>マトリックスはどこにでもある。${bluePill}<span>&nbsp;</span>それは私たちの周りにある。${redPill}<span>&nbsp;</span>トリックスはどこにでもある。それは私たちの周りにある。`,
            `${redPill}<span>&nbsp;</span>The Matrix is Everywhere.<span>&nbsp;</span>${bluePill}<span>&nbsp;</span>It's All Around Us.<span>&nbsp;</span>${redPill}<span>&nbsp;</span>The Matrix is Everywhere. It's All Around Us`
        ];

        const container2 = document.querySelector(".change-cont-3");

        let index = 0;
        setInterval(() => {
            container2.innerHTML = textOptions[index]; // Usa innerHTML para renderizar imágenes
            index = (index + 1) % textOptions.length;
        }, 9000);


        // ALL projects button animation
        const animatorProjects = new TextAnimator({
            letters_to_show: [
                "0", "1", "1", "1", "0", "0", "1", "1", '.', // w
                "0", "1", "1", "0", "0", "1", "1", '.', // a
                "0", "1", "1", "0", "1", "1", "0", "1", '.', // k
                "0", "1", "1", "1", "0", "1", "0", "1", '.', // e
                "0", "1", "1", "0", "1", "0", "0", '.', // (espacio)
                "0", "1", "1", "0", "0", "0", "0", "1", '.', // u
                "0", "1", "1", "1", "0", "0", "1", "0", '.', // p
                "0", "1", "1", "0", "0", "1", "1", '.', // (espacio)
                "0", "1", "1", "0", "1", "1", "1", "1", '.', // n
                "0", "1", "1", "0", "1", "1", "0", "1", '.', // e
                "0", "1", "1", "0", "1", "1", "0", "1", '.' // o
            ],

            containerSelector: ".change-cont-projects",
            charCycles: 10,
            charCycleLength: 100,
            all_characters: ["0", "1"],
            changeInterval: 3000
        });

        animatorProjects.init();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.getElementById("carousel");
    const cards = Array.from(document.querySelectorAll(".card"));
    let columns = 3;
    let rows = 2;
    let visibleCards = columns * rows;
    let startIndex = 0;

    function updateLayout() {
        if (window.innerWidth <= 480) {
            columns = 1;
        } else if (window.innerWidth <= 768) {
            columns = 2;
        } else {
            columns = 3;
        }
        visibleCards = columns * rows;
        updateCarousel();
    }

    function updateCarousel() {
        carousel.innerHTML = "";
        for (let i = startIndex; i < startIndex + visibleCards && i < cards.length; i++) {
            carousel.appendChild(cards[i]);
        }
    }

    document.getElementById("nextBtn").addEventListener("click", function () {
        if (startIndex + visibleCards < cards.length) {
            startIndex += visibleCards;
        } else {
            startIndex = 0;
        }
        updateCarousel();
    });

    document.getElementById("prevBtn").addEventListener("click", function () {
        if (startIndex - visibleCards >= 0) {
            startIndex -= visibleCards;
        } else {
            startIndex = Math.max(0, cards.length - visibleCards);
        }
        updateCarousel();
    });

    window.addEventListener("resize", updateLayout);
    updateLayout();
});