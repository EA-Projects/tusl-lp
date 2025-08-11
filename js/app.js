window.addEventListener('load', function() {   
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyC_Q6NGnDyKd8WM7e4yxg757_yB-g7QsRo",
        authDomain: "tusl-5a507.firebaseapp.com",
        projectId: "tusl-5a507",
        appId: "1:775259817894:web:a3cc3e8dcdb656619b7167",
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Main form to send data to Firestore [Email and Platform]
    if ($('#waitlist-form').length) {
        document.getElementById("waitlist-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            $('#waitlist-form').addClass('readonly');
            $('#waitlist-form input.button').val("Sending");

            const email = document.getElementById("email").value;
            const platform = document.querySelector('input[name="platform"]:checked').value;

            try {
                const docRef = await db.collection('waitlist').add({
                    email: email,
                    platform: platform,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Save the ID in localStorage to use it later in success.html
                localStorage.setItem('waitlistDocId', docRef.id);

                // Redirect to success page
                window.location.href = "/success.html";
            } catch (error) {
                $('#waitlist-form').removeClass('readonly');
                $('#waitlist-form input.button').val("Join Waitlist");
                console.error("Error registering in Firestore:", error);
            }
        });
    }

    // Referral form to update the existing document with referred emails
    if ($('#referral-form').length) {
        document.getElementById("referral-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            $('#referral-form').addClass('readonly');
            $('#referral-form input.button').val("Sending");

            // Obtener el ID guardado
            const docId = localStorage.getItem('waitlistDocId');

            if (!docId) {
                // Warning if no ID is found
                return;
            }

            // Get all referral inputs, normalize them to lowercase, and filter out empty values
            const referrals = Array.from(document.querySelectorAll(".referral-input"))
                .map(input => input.value.trim().toLowerCase()) // Normaliza en minúsculas
                .filter(email => email.length > 0);

            // Validate if there are duplicate emails
            const uniqueEmails = new Set(referrals);
            if (uniqueEmails.size !== referrals.length) {
                $('.alert-message').fadeIn();
                $('#referral-form').removeClass('readonly');
                $('#referral-form input.button').val("Submit");
                return;
            }

            try {
                await db.collection("waitlist").doc(docId).update({
                    referrals: referrals
                });

                // You can show a success message or redirect the user
                $('.success-form').fadeIn();
            } catch (error) {
                $('#referral-form').removeClass('readonly');
                $('#referral-form input.button').val("Submit");
                console.error("Error saving referrals:", error);
            }
        });
    }

    // Fix navbar when scroll
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 1) {
            $('nav').addClass('scrolled');
        } 
        else {
            $('nav').removeClass('scrolled');
        }
    });

    // Animations
    let animatedElements = new Set(); // Para evitar reanimaciones

    let observer = new IntersectionObserver((entries) => {
        // Filtrar los elementos que están entrando en vista y no han sido animados aún
        const toAnimate = entries
            .filter(entry => entry.isIntersecting && !animatedElements.has(entry.target))
            .map(entry => entry.target);

        if (toAnimate.length > 0) {
            gsap.to(toAnimate, {
                opacity: 1,
                y: 0,
                stagger: 0.15,
                ease: "power2.out",
                duration: 0.5,
                delay: 0.3
            });

            // Marcar los elementos como animados y dejar de observarlos
            toAnimate.forEach(el => {
                animatedElements.add(el);
                observer.unobserve(el);
            });
        }
    }, {
        threshold: 0.3
    });

    document.querySelectorAll("[data-fade]").forEach((el) => {
        observer.observe(el);
    });

});
