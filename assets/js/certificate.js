// Certificate JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();

    // Initialize certificate functionality
    initializeCertificateActions();
    initializeCertificateList();
    loadCertificateData();

    // Certificate data (in real app, this would come from API)
    const certificateData = {
        current: {
            id: 'OKI-2025-001234',
            investorName: 'JOHN ALEXANDER DOE',
            investmentName: 'Growth Fund A',
            type: 'Short-Term Growth',
            amount: 25000,
            expectedReturn: 12.5,
            investmentDate: '2025-01-15',
            maturityDate: '2025-03-15',
            duration: '8 Months',
            status: 'Active',
            certificateNumber: 'OKI-2025-001234'
        },
        certificates: [
            {
                id: 'OKI-2025-001234',
                name: 'Growth Fund A',
                amount: 25000,
                return: 12.5,
                maturity: '2025-03-15',
                status: 'active'
            },
            {
                id: 'OKI-2025-001235',
                name: 'Wealth Builder Pro',
                amount: 50000,
                return: 18.3,
                maturity: '2027-12-20',
                status: 'active'
            },
            {
                id: 'OKI-2024-000987',
                name: 'Secure Income',
                amount: 15000,
                return: 8.7,
                maturity: '2025-01-10',
                status: 'matured'
            }
        ]
    };

    function checkAuthentication() {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
            window.location.href = 'login.html';
            return;
        }

        const session = JSON.parse(userSession);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

        // Check if session is expired (24 hours)
        if (hoursSinceLogin > 24 && !session.remember) {
            localStorage.removeItem('userSession');
            window.location.href = 'login.html';
            return;
        }

        // Update certificate with user data
        updateCertificateData(session);
    }

    function updateCertificateData(session) {
        const investorName = document.querySelector('.investor-name');
        if (investorName && session.firstName && session.lastName) {
            const fullName = `${session.firstName} ${session.lastName}`.toUpperCase();
            investorName.textContent = fullName;
            certificateData.current.investorName = fullName;
        }
    }

    function initializeCertificateActions() {
        // Print button
        const printBtn = document.querySelector('button[onclick="window.print()"]');
        if (printBtn) {
            printBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handlePrint();
            });
        }

        // Download PDF button
        const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleDownloadPDF();
            });
        }

        // Back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.history.back();
            });
        }
    }

    function initializeCertificateList() {
        const certCards = document.querySelectorAll('.cert-card');
        certCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                certCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update certificate display
                const certificate = certificateData.certificates[index];
                if (certificate) {
                    updateCertificateDisplay(certificate);
                }
            });
        });
    }

    function loadCertificateData() {
        // Update certificate details with current data
        updateCertificateDisplay(certificateData.current);
        
        // Update certificate list
        updateCertificateList(certificateData.certificates);
    }

    function updateCertificateDisplay(data) {
        // Update certificate details
        const elements = {
            certificateNumber: document.querySelector('.detail-item .value'),
            investmentType: document.querySelectorAll('.detail-item .value')[1],
            investmentAmount: document.querySelectorAll('.detail-item .value')[2],
            expectedReturn: document.querySelectorAll('.detail-item .value')[3],
            investmentDate: document.querySelectorAll('.detail-item .value')[4],
            maturityDate: document.querySelectorAll('.detail-item .value')[5],
            termDuration: document.querySelectorAll('.detail-item .value')[6],
            status: document.querySelectorAll('.detail-item .value')[7]
        };

        if (elements.certificateNumber) {
            elements.certificateNumber.textContent = data.certificateNumber || data.id;
        }
        
        if (elements.investmentType) {
            elements.investmentType.textContent = data.type || 'Short-Term Growth';
        }
        
        if (elements.investmentAmount) {
            elements.investmentAmount.textContent = `$${(data.amount || 25000).toLocaleString()}.00`;
        }
        
        if (elements.expectedReturn) {
            elements.expectedReturn.textContent = `${data.return || data.expectedReturn || 12.5}% Annual`;
        }
        
        if (elements.investmentDate) {
            elements.investmentDate.textContent = formatDate(data.investmentDate || '2025-01-15');
        }
        
        if (elements.maturityDate) {
            elements.maturityDate.textContent = formatDate(data.maturityDate || data.maturity || '2025-03-15');
        }
        
        if (elements.termDuration) {
            elements.termDuration.textContent = data.duration || '8 Months';
        }
        
        if (elements.status) {
            elements.status.textContent = (data.status || 'Active').charAt(0).toUpperCase() + (data.status || 'Active').slice(1);
            elements.status.className = `value status-${data.status || 'active'}`;
        }

        // Update investment name in certificate statement
        const certStatement = document.querySelector('.cert-statement');
        if (certStatement) {
            const investmentName = data.investmentName || data.name || 'Growth Fund A';
            certStatement.innerHTML = `
                has successfully invested in our <strong>${investmentName}</strong> investment program
                and is entitled to the returns and benefits as outlined in the investment agreement.
            `;
        }
    }

    function updateCertificateList(certificates) {
        const certGrid = document.querySelector('.cert-grid');
        if (!certGrid) return;

        certGrid.innerHTML = '';

        certificates.forEach((cert, index) => {
            const certCard = document.createElement('div');
            certCard.className = `cert-card ${index === 0 ? 'active' : ''}`;
            certCard.innerHTML = `
                <div class="cert-card-header">
                    <h4>${cert.name}</h4>
                    <span class="cert-status ${cert.status}">${cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}</span>
                </div>
                <div class="cert-card-body">
                    <p><strong>Amount:</strong> $${cert.amount.toLocaleString()}</p>
                    <p><strong>Return:</strong> ${cert.return}%</p>
                    <p><strong>${cert.status === 'matured' ? 'Completed' : 'Maturity'}:</strong> ${formatDate(cert.maturity)}</p>
                </div>
                <div class="cert-card-footer">
                    <span class="cert-number">${cert.id}</span>
                </div>
            `;

            certCard.addEventListener('click', function() {
                // Remove active class from all cards
                document.querySelectorAll('.cert-card').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update certificate display
                updateCertificateDisplay({
                    ...cert,
                    certificateNumber: cert.id,
                    investmentName: cert.name,
                    type: cert.name.includes('Growth') ? 'Short-Term Growth' : 
                          cert.name.includes('Wealth') ? 'Long-Term Growth' : 'Secure Income',
                    expectedReturn: cert.return,
                    maturityDate: cert.maturity,
                    investmentDate: calculateInvestmentDate(cert.maturity, cert.name),
                    duration: calculateDuration(cert.maturity, cert.name)
                });
            });

            certGrid.appendChild(certCard);
        });
    }

    function calculateInvestmentDate(maturityDate, investmentName) {
        const maturity = new Date(maturityDate);
        let monthsBack = 8; // Default for short-term
        
        if (investmentName.includes('Wealth')) {
            monthsBack = 24; // 2 years for long-term
        } else if (investmentName.includes('Secure')) {
            monthsBack = 6; // 6 months for secure income
        }
        
        const investmentDate = new Date(maturity);
        investmentDate.setMonth(investmentDate.getMonth() - monthsBack);
        
        return investmentDate.toISOString().split('T')[0];
    }

    function calculateDuration(maturityDate, investmentName) {
        if (investmentName.includes('Wealth')) {
            return '2 Years';
        } else if (investmentName.includes('Secure')) {
            return '6 Months';
        }
        return '8 Months';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function handlePrint() {
        // Show loading notification
        showNotification('Preparing certificate for printing...', 'info');
        
        // Add print-specific styles
        const printStyles = `
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .certificate-wrapper,
                .certificate-wrapper * {
                    visibility: visible;
                }
                
                .certificate-wrapper {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    box-shadow: none;
                }
                
                .certificate {
                    max-width: none;
                    width: 100%;
                }
                
                .certificate-border {
                    border-width: 4px;
                    padding: 1rem;
                }
                
                .watermark {
                    opacity: 0.03;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = printStyles;
        document.head.appendChild(styleSheet);
        
        // Trigger print after a short delay
        setTimeout(() => {
            window.print();
            showNotification('Certificate sent to printer', 'success');
            
            // Remove print styles after printing
            setTimeout(() => {
                document.head.removeChild(styleSheet);
            }, 1000);
        }, 1000);
    }

    function handleDownloadPDF() {
        // Show loading notification
        showNotification('Generating PDF certificate...', 'info');
        
        // Simulate PDF generation (in real app, you would use a library like jsPDF or html2pdf)
        setTimeout(() => {
            // Create a blob URL for download simulation
            const certificateData = generateCertificateData();
            const blob = new Blob([certificateData], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `Investment_Certificate_${certificateData.current.certificateNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            showNotification('Certificate downloaded successfully', 'success');
        }, 2000);
    }

    function generateCertificateData() {
        // In a real application, this would generate actual PDF content
        // For now, we'll return a simple text representation
        const cert = certificateData.current;
        return `
OKEAMAH INVESTMENT
INVESTMENT CERTIFICATE

Certificate Number: ${cert.certificateNumber}
Investor: ${cert.investorName}
Investment: ${cert.investmentName}
Amount: $${cert.amount.toLocaleString()}
Return: ${cert.expectedReturn}%
Investment Date: ${formatDate(cert.investmentDate)}
Maturity Date: ${formatDate(cert.maturityDate)}
Status: ${cert.status}

This certificate represents a legal investment contract.
        `.trim();
    }

    // Global functions for certificate actions
    window.downloadPDF = handleDownloadPDF;

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
    }

    function removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid var(--primary-color);
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 10000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            border-left-color: var(--secondary-color);
        }
        
        .notification-error {
            border-left-color: #EF4444;
        }
        
        .notification-info {
            border-left-color: #3B82F6;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
        }
        
        .notification-content i {
            color: var(--primary-color);
        }
        
        .notification-success .notification-content i {
            color: var(--secondary-color);
        }
        
        .notification-error .notification-content i {
            color: #EF4444;
        }
        
        .notification-info .notification-content i {
            color: #3B82F6;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: all 0.3s ease;
        }
        
        .notification-close:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }
        
        .status-active {
            color: var(--secondary-color);
        }
        
        .status-matured {
            color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
            .notification {
                left: 20px;
                right: 20px;
                max-width: none;
                transform: translateY(-100%);
            }
            
            .notification.show {
                transform: translateY(0);
            }
        }
    `;

    // Inject notification styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);

    // Certificate verification functionality
    const qrCode = document.querySelector('.qr-code');
    if (qrCode) {
        qrCode.addEventListener('click', function() {
            showNotification('Certificate verification feature coming soon', 'info');
        });
    }

    // Security features
    const securityText = document.querySelector('.security-text');
    if (securityText) {
        securityText.addEventListener('click', function() {
            showNotification('Visit verify.okeamahinvestment.com to verify this certificate', 'info');
        });
    }

    // Auto-update certificate timestamp
    setInterval(() => {
        const now = new Date();
        const timestamp = now.toISOString();
        // In a real application, you might update a hidden timestamp field
        console.log('Certificate timestamp updated:', timestamp);
    }, 60000); // Update every minute
});