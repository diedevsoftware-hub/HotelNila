document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return; // Salir si el formulario no existe en la página

    const nombresInput = document.getElementById('nombres');
    const correoInput = document.getElementById('correo');
    const telefonoInput = document.getElementById('telefono');
    const asuntoInput = document.getElementById('asunto');
    const mensajeInput = document.getElementById('mensaje');
    const formMessagesArea = document.getElementById('form-contact-messages');

    // Guardar una referencia a los inputs para iterar si es necesario
    const fieldsToValidate = [
        { input: nombresInput, validator: validateNombres, id: 'nombres' },
        { input: correoInput, validator: validateCorreo, id: 'correo' },
        { input: telefonoInput, validator: validateTelefono, id: 'telefono' },
        { input: asuntoInput, validator: validateAsunto, id: 'asunto' },
        { input: mensajeInput, validator: validateMensaje, id: 'mensaje' }
    ];

    // Inicializar intl-tel-input
    let iti = null; // Declarar fuera para poder accederla
    if (telefonoInput) {
        iti = window.intlTelInput(telefonoInput, {
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("pe")); // Fallback a Perú
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
            preferredCountries: ['pe', 'co', 'ec', 'cl', 'ar', 'bo', 'us', 'es'],
            separateDialCode: true,
        });
    }

    // --- Funciones de ayuda para validación ---
    function showError(fieldId, message) {
        const inputElement = document.getElementById(fieldId);
        const errorElement = document.getElementById('error_' + fieldId);
        if (inputElement) {
            inputElement.classList.add('invalid');
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.setAttribute('aria-describedby', 'error_' + fieldId);
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block'; // Asegurar que sea visible
        }
    }

    function clearError(fieldId) {
        const inputElement = document.getElementById(fieldId);
        const errorElement = document.getElementById('error_' + fieldId);
        if (inputElement) {
            inputElement.classList.remove('invalid');
            inputElement.removeAttribute('aria-invalid');
            inputElement.removeAttribute('aria-describedby');
        }
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none'; // Ocultar si está vacío
        }
    }

    function clearAllErrors() {
        fieldsToValidate.forEach(fieldObj => {
            if (fieldObj.input) clearError(fieldObj.id);
        });
        if (formMessagesArea) {
            formMessagesArea.innerHTML = '';
            formMessagesArea.className = 'form-messages-area'; // Reset class
            formMessagesArea.style.display = 'none';
        }
    }

    function displayFormMessage(message, type = 'error') {
        if (formMessagesArea) {
            formMessagesArea.innerHTML = `<p>${message}</p>`;
            formMessagesArea.className = `form-messages-area ${type}`; // 'success' o 'error'
            formMessagesArea.style.display = 'block';
        }
    }

    // --- Funciones de validación específicas ---
    function validateNombres() {
        clearError('nombres');
        if (!nombresInput || !nombresInput.value.trim()) {
            showError('nombres', 'Por favor, ingrese sus nombres y apellidos.');
            return false;
        }
        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/; // Permitir apóstrofes y guiones
        if (!nombreRegex.test(nombresInput.value.trim())) {
            showError('nombres', 'Ingrese un nombre válido (solo letras, espacios, apóstrofes o guiones).');
            return false;
        }
        return true;
    }

    function validateCorreo() {
        clearError('correo');
        if (!correoInput) return true; // Si el campo no existe, no validar
        if (correoInput.value.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correoInput.value.trim())) {
                showError('correo', 'Ingrese un correo electrónico válido (ej: correo@dominio.com).');
                return false;
            }
        }
        return true;
    }

    function validateTelefono() {
        clearError('telefono');
        if (!telefonoInput || !iti) return false; // Necesario para la validación

        // Validar que el campo no esté vacío (considerando que intl-tel-input puede tener solo el código de país)
        if (!telefonoInput.value.trim() && !iti.getNumber()) {
            showError('telefono', 'Por favor, ingrese su número de celular.');
            return false;
        }
        if (iti.isValidNumber()) {
            return true;
        } else {
            // El mensaje de error de iti.isValidNumber() a veces no es muy amigable.
            // Podrías obtener el código de error con iti.getValidationError() y dar mensajes más específicos si quieres.
            // Ejemplo: intlTelInputUtils.validationError.TOO_SHORT, etc.
            showError('telefono', 'Ingrese un número de celular válido para el país seleccionado.');
            return false;
        }
    }

    function validateAsunto() {
        clearError('asunto');
        if (!asuntoInput || !asuntoInput.value.trim()) {
            showError('asunto', 'Por favor, ingrese un asunto.');
            return false;
        }
        return true;
    }

    function validateMensaje() {
        clearError('mensaje');
        if (!mensajeInput || !mensajeInput.value.trim()) {
            showError('mensaje', 'Por favor, escriba su mensaje.');
            return false;
        }
        if (mensajeInput.value.trim().length < 10) {
            showError('mensaje', 'Su mensaje debe tener al menos 10 caracteres.');
            return false;
        }
        return true;
    }

    // Añadir listeners para validación "en vivo" (onblur)
    fieldsToValidate.forEach(fieldObj => {
        if (fieldObj.input) {
            fieldObj.input.addEventListener('blur', fieldObj.validator);
            // Opcional: validar también en 'input' para feedback más inmediato, pero puede ser molesto
            // fieldObj.input.addEventListener('input', fieldObj.validator);
        }
    });


    // --- Submit del formulario ---
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        clearAllErrors();

        let isFormValid = true;
        let firstInvalidField = null;

        fieldsToValidate.forEach(fieldObj => {
            if (fieldObj.input && !fieldObj.validator()) {
                isFormValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = fieldObj.input;
                }
            }
        });

        if (isFormValid) {
            const numeroWhatsappEmpresa = "51917414764";
            let mensajeWsp = "CONSULTA DESDE LA WEB (HOTEL NILA):\n\n"; // Añadir nombre del hotel
            mensajeWsp += `*Nombre:* ${nombresInput.value.trim()}\n`;
            if (correoInput && correoInput.value.trim()) {
                mensajeWsp += `*Correo:* ${correoInput.value.trim()}\n`;
            }
            if (iti) {
                const numeroCompleto = iti.getNumber(intlTelInputUtils.numberFormat.E164);
                mensajeWsp += `*Celular:* ${numeroCompleto}\n`;
            } else if (telefonoInput) { // Fallback si iti no se inicializó
                mensajeWsp += `*Celular:* ${telefonoInput.value.trim()}\n`;
            }
            mensajeWsp += `*Asunto:* ${asuntoInput.value.trim()}\n\n`;
            mensajeWsp += `*Mensaje:*\n${mensajeInput.value.trim()}`;

            const whatsappUrl = `https://wa.me/${numeroWhatsappEmpresa}?text=${encodeURIComponent(mensajeWsp)}`;

            displayFormMessage('¡Mensaje listo! Redirigiendo a WhatsApp...', 'success');

            // Pequeña demora para que el usuario vea el mensaje antes de la redirección
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                // Opcional: Limpiar formulario después de enviar
                // contactForm.reset();
                // if (iti) iti.setCountry("pe"); // Resetear país del input telefónico
                // clearAllErrors(); // Limpiar mensajes de éxito también si se resetea
            }, 1500);

        } else {
            displayFormMessage('Por favor, corrige los errores marcados en el formulario.', 'error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    });
});