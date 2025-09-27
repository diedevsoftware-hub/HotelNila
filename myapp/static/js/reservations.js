document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('bookingForm');
    const fechaLlegadaInput = document.getElementById('fecha_llegada');
    const horaLlegadaInput = document.getElementById('hora_llegada');
    const fechaSalidaInput = document.getElementById('fecha_salida');
    const adultosTotalInput = document.getElementById('adultos_total');
    const ninosTotalInput = document.getElementById('ninos_total');
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const telefonoInput = document.getElementById('telefono');
    const paisInput = document.getElementById('pais');
    const comentariosInput = document.getElementById('comentarios');

    const roomInputs = [
        document.getElementById('qty_matrimonial_estandar'),
        document.getElementById('qty_matrimonial_premium'),
        document.getElementById('qty_triple_familiar'),
        document.getElementById('qty_cuadruple_familiar')
    ];

    const formMessagesArea = document.getElementById('form-messages');

    const iti = window.intlTelInput(telefonoInput, {
        initialCountry: "auto",
        geoIpLookup: function (callback) {
            fetch("https://ipapi.co/json")
                .then(res => res.json())
                .then(data => callback(data.country_code))
                .catch(() => callback("pe"));
        },
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
        preferredCountries: ['pe', 'co', 'ec', 'cl', 'ar', 'bo', 'us', 'es'],
        separateDialCode: true,
    });

    function getTodayStringLocal() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const day = hoy.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function showError(inputId, message) {
        const inputElement = document.getElementById(inputId);
        const errorElement = document.getElementById('error_' + inputId);
        if (inputElement) inputElement.classList.add('invalid');
        if (errorElement) errorElement.textContent = message;
    }

    function clearError(inputId) {
        const inputElement = document.getElementById(inputId);
        const errorElement = document.getElementById('error_' + inputId);
        if (inputElement) inputElement.classList.remove('invalid');
        if (errorElement) errorElement.textContent = '';
    }

    function clearAllErrors() {
        form.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        form.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
        if (formMessagesArea) formMessagesArea.innerHTML = '';
    }

    function actualizarMinHoraLlegada() {
        if (!fechaLlegadaInput.value) {
            horaLlegadaInput.removeAttribute('min');
            // Opcional: si se borra la fecha de llegada, también limpiar la hora
            // horaLlegadaInput.value = ''; 
            // clearError('hora_llegada');
            return;
        }

        const todayStringLocal = getTodayStringLocal();
        if (fechaLlegadaInput.value === todayStringLocal) {
            const ahora = new Date();
            const currentHour = ahora.getHours();
            const currentMinute = ahora.getMinutes();
            const minTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

            horaLlegadaInput.setAttribute('min', minTimeString);

            if (horaLlegadaInput.value) {
                const [selectedHour, selectedMinute] = horaLlegadaInput.value.split(':').map(Number);
                if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
                    horaLlegadaInput.value = ''; // Limpiar si la hora seleccionada es anterior
                    clearError('hora_llegada');
                }
            }
        } else { // Fecha de llegada es futura o no válida (aunque validación previa debería evitarlo)
            horaLlegadaInput.removeAttribute('min');
        }
    }

    function configurarFechasIniciales() {
        const todayStringLocal = getTodayStringLocal();
        fechaLlegadaInput.setAttribute('min', todayStringLocal);

        if (fechaLlegadaInput.value && fechaLlegadaInput.value >= todayStringLocal) {
            fechaSalidaInput.setAttribute('min', fechaLlegadaInput.value); // Salida min = Llegada
            if (fechaSalidaInput.value && fechaSalidaInput.value < fechaLlegadaInput.value) {
                fechaSalidaInput.value = '';
            }
        } else if (fechaLlegadaInput.value && fechaLlegadaInput.value < todayStringLocal) {
            // Si hay un valor precargado inválido (anterior a hoy)
            fechaLlegadaInput.value = '';
            fechaSalidaInput.setAttribute('min', '');
            fechaSalidaInput.value = '';
        } else {
            fechaSalidaInput.setAttribute('min', '');
        }
        actualizarMinHoraLlegada();
    }


    // --- Funciones de validación específicas ---
    function validateFechaLlegada() {
        clearError('fecha_llegada');
        if (!fechaLlegadaInput.value) {
            showError('fecha_llegada', 'Seleccione la fecha de llegada.');
            return false;
        }
        // Comparamos fechas sin considerar la hora para la validación de "anterior a hoy"
        const fechaLlegadaNormalizada = new Date(fechaLlegadaInput.value + "T00:00:00Z"); // Tratar como UTC para consistencia
        const hoyNormalizada = new Date(getTodayStringLocal() + "T00:00:00Z");

        if (fechaLlegadaNormalizada < hoyNormalizada) {
            showError('fecha_llegada', 'La fecha de llegada no puede ser anterior a hoy.');
            return false;
        }
        return true;
    }

    function validateHoraLlegada() {
        clearError('hora_llegada');
        if (!horaLlegadaInput.value) {
            showError('hora_llegada', 'Ingrese la hora estimada de llegada.');
            return false;
        }

        const minTimeAttr = horaLlegadaInput.getAttribute('min');
        if (minTimeAttr && fechaLlegadaInput.value === getTodayStringLocal()) {
            if (horaLlegadaInput.value < minTimeAttr) {
                showError('hora_llegada', `La hora de llegada para hoy no puede ser anterior a las ${minTimeAttr}.`);
                return false;
            }
        }
        return true;
    }

    function validateFechaSalida() {
        clearError('fecha_salida');
        if (!fechaSalidaInput.value) {
            showError('fecha_salida', 'Seleccione la fecha de salida.');
            return false;
        }
        if (fechaLlegadaInput.value && fechaSalidaInput.value < fechaLlegadaInput.value) {
            showError('fecha_salida', 'La fecha de salida no puede ser anterior a la fecha de llegada.');
            return false;
        }
        return true;
    }

    // --- Event Listeners para fechas y hora ---
    fechaLlegadaInput.addEventListener('change', function () {
        const esValidaLlegada = validateFechaLlegada();

        if (esValidaLlegada) {
            if (this.value) {
                fechaSalidaInput.setAttribute('min', this.value); // Salida min = Llegada
                if (fechaSalidaInput.value && fechaSalidaInput.value < this.value) {
                    fechaSalidaInput.value = '';
                    clearError('fecha_salida');
                }
            } else { // Si se borra la fecha de llegada
                fechaSalidaInput.setAttribute('min', '');
                fechaSalidaInput.value = '';
                clearError('fecha_salida');

                horaLlegadaInput.value = ''; // Limpiar hora también
                clearError('hora_llegada');
            }
        } else { // Si la fecha de llegada es inválida (ej. anterior a hoy)
            fechaSalidaInput.setAttribute('min', '');
            fechaSalidaInput.value = '';
            clearError('fecha_salida');

            horaLlegadaInput.value = ''; // Limpiar hora también
            clearError('hora_llegada');
        }
        actualizarMinHoraLlegada(); // Siempre actualizar restricción de hora
        validateField(fechaSalidaInput, validateFechaSalida); // Revalidar salida
    });

    fechaLlegadaInput.addEventListener('blur', () => validateField(fechaLlegadaInput, validateFechaLlegada));
    horaLlegadaInput.addEventListener('blur', () => validateField(horaLlegadaInput, validateHoraLlegada));
    fechaSalidaInput.addEventListener('blur', () => validateField(fechaSalidaInput, validateFechaSalida));

    // --- Resto de funciones de validación (sin cambios respecto a la versión anterior) ---
    function validateAdultosTotal() {
        clearError('adultos_total');
        const adultos = parseInt(adultosTotalInput.value, 10);
        if (isNaN(adultos) || adultos < 1) {
            showError('adultos_total', 'Ingrese total de adultos (mínimo 1).');
            return false;
        }
        return true;
    }

    function validateNinosTotal() {
        clearError('ninos_total');
        if (ninosTotalInput.value !== '') {
            const ninos = parseInt(ninosTotalInput.value, 10);
            if (isNaN(ninos) || ninos < 0) {
                showError('ninos_total', 'El total de niños no puede ser negativo.');
                return false;
            }
        }
        return true;
    }

    function validateHabitaciones() {
        clearError('habitaciones');
        let totalHabitacionesSeleccionadas = 0;
        roomInputs.forEach(input => {
            const val = parseInt(input.value, 10);
            if (!isNaN(val) && val > 0) {
                totalHabitacionesSeleccionadas += val; // Sumar cantidad de habitaciones, no solo contar inputs > 0
            }
            if (!isNaN(val) && val < 0) input.value = 0;
        });
        if (totalHabitacionesSeleccionadas === 0) {
            showError('habitaciones', 'Escoge al menos un tipo de habitación (cantidad > 0).');
            return false;
        }
        return true;
    }

    function validateNombre() {
        clearError('nombre');
        const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nombreInput.value.trim()) {
            showError('nombre', 'Ingrese su nombre completo.');
            return false;
        }
        if (!nombreRegex.test(nombreInput.value.trim())) {
            showError('nombre', 'Ingrese un nombre válido (solo letras y espacios).');
            return false;
        }
        return true;
    }

    function validateEmail() {
        clearError('email');
        if (emailInput.value.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                showError('email', 'Ingrese un correo electrónico válido.');
                return false;
            }
        }
        return true;
    }

    function validateTelefono() {
        clearError('telefono');
        if (!telefonoInput.value.trim() && !iti.getNumber()) { // Chequear si el input está vacío incluso con el código de país
            showError('telefono', 'Ingrese un número de celular.');
            return false;
        }
        if (iti.isValidNumber()) {
            const justDigits = telefonoInput.value.replace(/\D/g, '');
            if (justDigits.length < 7 || justDigits.length > 15) { // Ajustado a 7 por si algunos países tienen números más cortos
                showError('telefono', 'El número debe tener entre 7 y 15 dígitos (sin código de país).');
                return false;
            }
            return true;
        } else {
            showError('telefono', 'Ingrese un número de celular válido con código de país.');
            return false;
        }
    }

    function validatePais() {
        clearError('pais');
        const paisRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.]+$/; // Permitir punto
        if (!paisInput.value.trim()) {
            showError('pais', 'Ingrese su ciudad de residencia.');
            return false;
        }
        if (!paisRegex.test(paisInput.value.trim())) {
            showError('pais', 'Ingrese una ciudad válida (letras, espacios, comas, puntos).');
            return false;
        }
        return true;
    }

    function validateField(field, validationFunction) {
        validationFunction();
    }

    // Añadir listeners para validación "en vivo"
    adultosTotalInput.addEventListener('blur', () => validateField(adultosTotalInput, validateAdultosTotal));
    ninosTotalInput.addEventListener('blur', () => validateField(ninosTotalInput, validateNinosTotal));
    nombreInput.addEventListener('blur', () => validateField(nombreInput, validateNombre));
    emailInput.addEventListener('blur', () => validateField(emailInput, validateEmail));
    telefonoInput.addEventListener('blur', () => validateField(telefonoInput, validateTelefono));
    paisInput.addEventListener('blur', () => validateField(paisInput, validatePais));
    roomInputs.forEach(input => {
        input.addEventListener('blur', () => validateHabitaciones());
    });

    // --- Submit del formulario ---
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearAllErrors();

        let isValid = true;
        let errorList = [];
        let firstInvalidField = null; // Variable para guardar el primer campo inválido

        if (!validateFechaLlegada()) {
            isValid = false;
            errorList.push("Fecha de llegada es inválida.");
            if (!firstInvalidField) firstInvalidField = fechaLlegadaInput; // Asignar primer inválido
        }
        if (!validateHoraLlegada()) {
            isValid = false;
            errorList.push("Hora de llegada es inválida.");
            if (!firstInvalidField) firstInvalidField = horaLlegadaInput;
        }
        if (!validateFechaSalida()) {
            isValid = false;
            errorList.push("Fecha de salida es inválida.");
            if (!firstInvalidField) firstInvalidField = fechaSalidaInput;
        }
        if (!validateAdultosTotal()) {
            isValid = false;
            errorList.push("Total de adultos es inválido.");
            if (!firstInvalidField) firstInvalidField = adultosTotalInput;
        }
        if (!validateNinosTotal()) {
            isValid = false;
            errorList.push("Total de niños es inválido.");
            // Ninos es opcional, pero si se ingresa y es inválido, puede ser el primero
            if (!ninosTotalInput.value && parseInt(ninosTotalInput.value) < 0 && !firstInvalidField) {
                firstInvalidField = ninosTotalInput;
            }
        }

        // Para habitaciones, si es inválido, el "error" visual está en #error_habitaciones (un span)
        // Necesitamos hacer scroll al fieldset o al primer input de habitación.
        let habitacionesValidas = validateHabitaciones();
        if (!habitacionesValidas) {
            isValid = false;
            errorList.push("Debe seleccionar al menos una habitación.");
            if (!firstInvalidField) firstInvalidField = document.getElementById('qty_matrimonial_estandar'); // O el fieldset
        }

        if (!validateNombre()) {
            isValid = false;
            errorList.push("Nombre es inválido.");
            if (!firstInvalidField) firstInvalidField = nombreInput;
        }
        // Email es opcional, solo es error si está mal formateado
        if (emailInput.value.trim() && !validateEmail()) {
            isValid = false;
            errorList.push("Email es inválido.");
            if (!firstInvalidField) firstInvalidField = emailInput;
        }
        if (!validateTelefono()) {
            isValid = false;
            errorList.push("Teléfono es inválido.");
            if (!firstInvalidField) firstInvalidField = telefonoInput;
        }
        if (!validatePais()) {
            isValid = false;
            errorList.push("Ciudad de residencia es inválida.");
            if (!firstInvalidField) firstInvalidField = paisInput;
        }

        if (isValid) {
            const numeroWhatsappEmpresa = "51917414764";
            let mensaje = "SOLICITUD DE RESERVA:\n\n";
            mensaje += `*Llegada:* ${formatDate(fechaLlegadaInput.value)} a las ${horaLlegadaInput.value}\n`;
            mensaje += `*Salida:* ${formatDate(fechaSalidaInput.value)}\n`;
            mensaje += `*Adultos:* ${adultosTotalInput.value}\n`;
            mensaje += `*Niños:* ${ninosTotalInput.value || '0'}\n\n`;

            mensaje += "*Habitaciones Solicitadas:*\n";
            let algunaHabitacion = false;
            if (parseInt(roomInputs[0].value) > 0) { mensaje += `- Matrimonial Estándar: ${roomInputs[0].value}\n`; algunaHabitacion = true; }
            if (parseInt(roomInputs[1].value) > 0) { mensaje += `- Matrimonial Premium: ${roomInputs[1].value}\n`; algunaHabitacion = true; }
            if (parseInt(roomInputs[2].value) > 0) { mensaje += `- Triple Familiar: ${roomInputs[2].value}\n`; algunaHabitacion = true; }
            if (parseInt(roomInputs[3].value) > 0) { mensaje += `- Cuádruple Familiar: ${roomInputs[3].value}\n`; algunaHabitacion = true; }
            if (!algunaHabitacion) mensaje += "- Error en selección de habitación (no debería pasar).\n";
            mensaje += "\n";

            mensaje += "*Datos de Contacto:*\n";
            mensaje += `*Nombre:* ${nombreInput.value.trim()}\n`;
            if (emailInput.value.trim()) {
                mensaje += `*Email:* ${emailInput.value.trim()}\n`;
            }
            const numeroCompleto = iti.getNumber(intlTelInputUtils.numberFormat.E164);
            mensaje += `*Celular:* ${numeroCompleto}\n`;
            mensaje += `*Ciudad de Residencia:* ${paisInput.value.trim()}\n\n`;

            if (comentariosInput.value.trim()) {
                mensaje += `*Comentarios Adicionales:*\n${comentariosInput.value.trim()}\n`;
            }
            mensaje += "\n_Por favor, confirmar disponibilidad y proceder con la reserva._";
            const whatsappUrl = `https://wa.me/${numeroWhatsappEmpresa}?text=${encodeURIComponent(mensaje)}`;

            if (formMessagesArea) {
                formMessagesArea.classList.remove('error');
                formMessagesArea.classList.add('success');
                formMessagesArea.innerHTML = '<p style="color: green; font-weight: bold;">¡Solicitud casi lista! Redirigiendo a WhatsApp...</p>';
                formMessagesArea.style.backgroundColor = '#d4edda';
                formMessagesArea.style.color = '#155724';
                formMessagesArea.style.borderColor = '#c3e6cb';
                formMessagesArea.style.display = 'block';
            }
            window.open(whatsappUrl, '_blank');
        } else {
            if (formMessagesArea && errorList.length > 0) {
                formMessagesArea.classList.remove('success');
                formMessagesArea.classList.add('error');
                let errorHtml = '<strong>Por favor, corrige los siguientes errores:</strong><ul>';
                errorList.forEach(err => { errorHtml += `<li>${err}</li>`; });
                errorHtml += '</ul>';
                formMessagesArea.innerHTML = errorHtml;
                formMessagesArea.style.display = 'block';

                // Scroll al primer campo inválido
                if (firstInvalidField) {
                    // Intentar hacer scroll al label asociado o al propio campo
                    let elementToScrollTo = firstInvalidField;
                    const labelForField = document.querySelector(`label[for="${firstInvalidField.id}"]`);

                    if (labelForField) {
                        elementToScrollTo = labelForField;
                    }

                    elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // También puedes hacer focus en el campo después del scroll
                    // setTimeout(() => firstInvalidField.focus(), 500); // Pequeño delay para asegurar que el scroll terminó
                }
            }
        }
    });

    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    // --- Inicialización ---
    configurarFechasIniciales();
});