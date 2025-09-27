// static/js/theme.js
document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const bodyElement = document.documentElement; // Usamos documentElement (html tag) para data-theme
    const logoDark = document.querySelectorAll('.logo-dark-theme'); // Puede haber múltiples (header, footer)
    const logoLight = document.querySelectorAll('.logo-light-theme');
    const sunIcon = themeToggleButton ? themeToggleButton.querySelector('.fa-sun') : null;
    const moonIcon = themeToggleButton ? themeToggleButton.querySelector('.fa-moon') : null;

    // 1. Sticky Header con cambio de opacidad/blur
    if (siteHeader) {
        const stickyThreshold = 50; // Píxeles para activar el estado "scrolled"
        window.addEventListener('scroll', () => {
            if (window.scrollY > stickyThreshold) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        });
    }

    // 2. Menú Hamburguesa
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            // Cambiar icono de hamburguesa a X (opcional)
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times'); // Necesitas Font Awesome para fa-times
            }
        });
    }

    // 3. Theme Toggler
    const applyTheme = (theme) => {
        bodyElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            logoDark.forEach(logo => logo.style.display = 'inline-block');
            logoLight.forEach(logo => logo.style.display = 'none');
            if (sunIcon) sunIcon.style.display = 'inline-block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            logoDark.forEach(logo => logo.style.display = 'none');
            logoLight.forEach(logo => logo.style.display = 'inline-block');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline-block';
        }
        localStorage.setItem('theme', theme);
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = bodyElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Cargar tema guardado o preferido por el sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // O 'dark' si quieres que sea el por defecto sin preferencia
    }
     // Asegurar que los logos correctos se muestren al cargar la página por primera vez,
    // especialmente si el tema por defecto en HTML es 'dark' pero JS lo cambia a 'light'
    const initialTheme = bodyElement.getAttribute('data-theme');
    applyTheme(initialTheme); // Re-aplica para asegurar consistencia visual de logos/iconos

});