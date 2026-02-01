document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-card, .section-title, .hero-content > *, .unlimited-content > *, .unlimited-image');

    animatedElements.forEach(el => {
        el.classList.add('fade-up');
        observer.observe(el);
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(5, 5, 5, 0.8)';
            header.style.boxShadow = 'none';
        }
    });


    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.querySelector('body');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
    }


    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close other items (optional - if you want only one open at a time)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });

    // ========================================
    // CALCULATOR LOGIC
    // ========================================
    const COSTS = {
        marketing: 0.37,
        utility: 0.08
    };

    const CONVERSION_RATES = {
        pessimista: 0.01,
        realista: 0.03,
        otimista: 0.05
    };

    const SCENARIO_LABELS = {
        pessimista: 'Cenário Pessimista (1%)',
        realista: 'Cenário Realista (3%)',
        otimista: 'Cenário Otimista (5%)'
    };

    // Store calculation data
    let calcData = {
        contacts: 0,
        type: 'marketing',
        scenario: 'realista',
        cost: 0,
        conversions: 0,
        cpl: 0
    };

    // Elements
    const btnCalculate = document.getElementById('btn-calculate');
    const btnReset = document.getElementById('btn-reset');
    const leadForm = document.getElementById('lead-form');

    // Format currency
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Format number
    function formatNumber(value) {
        return value.toLocaleString('pt-BR');
    }

    // Show step
    function showStep(stepNumber) {
        document.querySelectorAll('.calc-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`calc-step-${stepNumber}`).classList.add('active');
    }

    // Calculate results
    function calculate() {
        const contacts = parseInt(document.getElementById('calc-contacts').value) || 0;
        const type = document.getElementById('calc-type').value;
        const scenario = document.getElementById('calc-scenario').value;

        if (contacts <= 0) {
            alert('Por favor, insira a quantidade de contatos');
            return false;
        }

        const ticket = parseInt(document.getElementById('calc-ticket').value) || 500;
        const costPerMsg = COSTS[type];
        const conversionRate = CONVERSION_RATES[scenario];

        const totalCost = contacts * costPerMsg;
        const conversions = Math.round(contacts * conversionRate);
        const revenue = conversions * ticket;
        const roi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;

        calcData = {
            contacts: contacts,
            type: type,
            scenario: scenario,
            ticket: ticket,
            cost: totalCost,
            conversions: conversions,
            revenue: revenue,
            roi: roi,
            cpl: conversions > 0 ? totalCost / conversions : 0
        };

        // Update preview
        document.getElementById('preview-contacts').textContent = formatNumber(contacts);

        return true;
    }

    // Show results
    function showResults() {
        document.getElementById('result-contacts').textContent = formatNumber(calcData.contacts);
        document.getElementById('result-cost').textContent = formatCurrency(calcData.cost);
        document.getElementById('result-conversions').textContent = formatNumber(calcData.conversions);
        document.getElementById('result-revenue').textContent = formatCurrency(calcData.revenue);
        document.getElementById('result-cpl').textContent = calcData.conversions > 0
            ? formatCurrency(calcData.cpl)
            : 'N/A';
        document.getElementById('result-roi').textContent = calcData.roi > 0
            ? `${formatNumber(Math.round(calcData.roi))}%`
            : 'N/A';
        document.getElementById('result-scenario-label').textContent = SCENARIO_LABELS[calcData.scenario];

        showStep(3);
    }

    // Track if lead was already captured
    let leadCaptured = false;

    // Reset calculator (for new simulation)
    function resetCalculator() {
        document.getElementById('calc-contacts').value = '';
        document.getElementById('calc-type').value = 'marketing';
        document.getElementById('calc-scenario').value = 'realista';
        // Don't reset lead data - keep it for new simulations
        showStep(1);
    }

    // Event Listeners
    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            if (calculate()) {
                // If lead was already captured, skip to results
                if (leadCaptured) {
                    showResults();
                } else {
                    showStep(2);
                }
            }
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', resetCalculator);
    }

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('lead-name').value;
            const email = document.getElementById('lead-email').value;
            const phone = document.getElementById('lead-phone').value;

            // Mark lead as captured
            leadCaptured = true;

            // Send to webhook (configure your GHL webhook URL here)
            sendToWebhook({
                source: 'calculadora',
                name,
                email,
                phone,
                ...calcData
            });

            // Show results
            showResults();
        });
    }

    // ========================================
    // CONTACT FORM LOGIC
    // ========================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const phone = document.getElementById('contact-phone').value;
            const interest = document.getElementById('contact-interest').value;

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Send to webhook
            sendToWebhook({
                source: 'contato',
                name,
                email,
                phone,
                interest
            }).then(() => {
                // Show success state
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Enviado com Sucesso!';
                submitBtn.style.background = '#22c55e';

                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }).catch(() => {
                // Show error state
                submitBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Erro. Tente novamente.';
                submitBtn.style.background = '#ef4444';

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
        });
    }

    // ========================================
    // WEBHOOK HELPER
    // ========================================
    async function sendToWebhook(data) {
        // GHL Webhook URL
        const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/7yA19Mve2EvPTqurPPsv/webhook-trigger/528a1b66-84eb-4c3e-9011-6480a71ff211';

        // Add timestamp
        data.timestamp = new Date().toISOString();
        data.page_url = window.location.href;

        console.log('Sending to webhook:', data);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Webhook request failed');
            }

            return response;
        } catch (error) {
            console.error('Webhook error:', error);
            throw error;
        }
    }
});
