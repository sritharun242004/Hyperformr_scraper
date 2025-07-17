// Configuration - Enhanced with better error handling
const CONFIG = {
    API_BASE: window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 30000
};

// Global state
let currentPage = 1;
let currentSearch = '';
let currentSort = 'company_name';
let currentFilters = {};
let isLoading = false;
let filterOptions = {};
let serverConnected = false;

// DOM Elements
const elements = {
    urlInput: document.getElementById('urlInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    businessGrid: document.getElementById('businessGrid'),
    businessCount: document.getElementById('businessCount'),
    emptyState: document.getElementById('emptyState'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    successState: document.getElementById('successState'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    businessModal: document.getElementById('businessModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalContent: document.getElementById('modalContent'),
    closeModal: document.getElementById('closeModal'),
    deleteBusinessBtn: document.getElementById('deleteBusinessBtn'),
    visitWebsiteBtn: document.getElementById('visitWebsiteBtn'),
    totalBusinesses: document.getElementById('totalBusinesses'),
    filterPanel: null,
    dashboardStats: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Business Analyzer Frontend Initialized');
    
    createUI();
    bindEventListeners();
    
    // Enhanced startup sequence
    initializeApp();
});

async function initializeApp() {
    console.log('🔍 Initializing application...');
    
    // Check API health first
    const healthCheck = await checkAPIHealth();
    
    if (healthCheck.success) {
        console.log('✅ API connection successful');
        serverConnected = true;
        
        // Load data if server is connected
        try {
            await Promise.all([
                loadBusinesses(),
                loadStats(),
                loadFilterOptions()
            ]);
        } catch (error) {
            console.error('⚠️  Failed to load initial data:', error);
        }
    } else {
        console.error('❌ API connection failed:', healthCheck.error);
        serverConnected = false;
        showServerConnectionError();
    }
}

function showServerConnectionError() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'server-error-banner';
    errorDiv.innerHTML = `
        <div class="error-banner">
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h3>Backend Server Not Connected</h3>
                    <p>Please start the Flask server to use the application</p>
                </div>
                <button onclick="retryConnection()" class="retry-btn">
                    <i class="fas fa-refresh"></i>
                    Retry Connection
                </button>
            </div>
        </div>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: #f44336;
        color: white;
        padding: 15px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Disable analyze button
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.textContent = 'Server Not Connected';
}

async function retryConnection() {
    console.log('🔄 Retrying connection...');
    
    const errorBanner = document.querySelector('.server-error-banner');
    if (errorBanner) {
        errorBanner.remove();
    }
    
    // Re-enable analyze button
    elements.analyzeBtn.disabled = false;
    elements.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Business';
    
    await initializeApp();
}

// Enhanced API call function with retry logic
async function apiCall(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE}${endpoint}`;
    console.log(`🌐 Making request to: ${url}`);
    
    for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                },
                mode: 'cors',
                signal: controller.signal,
                ...options
            });
            
            clearTimeout(timeoutId);
            console.log(`📡 Response status: ${response.status} (Attempt ${attempt})`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error: ${response.status} - ${errorText}`);
                throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log(`📦 Response data:`, data);
            
            return data;
            
        } catch (error) {
            console.error(`❌ API Error (Attempt ${attempt}):`, error);
            
            if (attempt === CONFIG.RETRY_ATTEMPTS) {
                // Provide specific error messages based on error type
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. The server might be overloaded.');
                } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    throw new Error('Cannot connect to server. Make sure the backend is running on localhost:5001');
                } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
                    throw new Error('Network error. Check your internet connection and backend server.');
                } else if (error.message.includes('CORS')) {
                    throw new Error('CORS error. Backend server configuration issue.');
                } else {
                    throw error;
                }
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
        }
    }
}

// Enhanced API Health Check
async function checkAPIHealth() {
    try {
        console.log('🔍 Checking API health...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${CONFIG.API_BASE}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API is running');
            console.log('📊 Health data:', data);
            
            return { success: true, data };
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        
        let errorMessage = 'Unknown connection error';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Connection timeout - server not responding';
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Please start the backend server with: python start_server.py';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Network error - check your connection';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS error - backend configuration issue';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Create UI elements
function createUI() {
    createFilterPanel();
    createDashboardStats();
    enhanceSearchInput();
    enhanceSortSelect();
}

function createFilterPanel() {
    const controlsDiv = document.querySelector('.controls');
    
    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <button id="toggleFilters" class="btn btn-secondary">
            <i class="fas fa-filter"></i>
            Advanced Filters
        </button>
        <div id="filterOptions" class="filter-options" style="display: none;">
            <div class="filter-row">
                <select id="businessTypeFilter" class="filter-select">
                    <option value="">All Business Types</option>
                </select>
                <select id="industryFilter" class="filter-select">
                    <option value="">All Industries</option>
                </select>
                <select id="companySizeFilter" class="filter-select">
                    <option value="">All Company Sizes</option>
                </select>
                <select id="locationFilter" class="filter-select">
                    <option value="">All Locations</option>
                </select>
            </div>
            <div class="filter-actions">
                <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
                <button id="clearFilters" class="btn btn-secondary">Clear</button>
            </div>
        </div>
    `;
    
    controlsDiv.appendChild(filterPanel);
    elements.filterPanel = filterPanel;
}

function createDashboardStats() {
    const heroContainer = document.querySelector('.hero-container');
    
    const statsPanel = document.createElement('div');
    statsPanel.className = 'dashboard-stats';
    statsPanel.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <div class="stat-number" id="totalBusinessesStat">0</div>
                    <div class="stat-label">Total Businesses</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🆕</div>
                <div class="stat-info">
                    <div class="stat-number" id="recentAdditionsStat">0</div>
                    <div class="stat-label">Recent Additions</div>
                </div>
            </div>
        </div>
    `;
    
    heroContainer.appendChild(statsPanel);
    elements.dashboardStats = statsPanel;
}

function enhanceSearchInput() {
    const searchGroup = document.querySelector('.search-group');
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    suggestionsDiv.id = 'searchSuggestions';
    suggestionsDiv.style.display = 'none';
    
    searchGroup.appendChild(suggestionsDiv);
}

function enhanceSortSelect() {
    const sortSelect = elements.sortSelect;
    
    const newOptions = [
        { value: 'relevance', text: 'Sort by Relevance' },
        { value: 'data_completeness', text: 'Sort by Data Completeness' },
        { value: 'business_maturity', text: 'Sort by Business Maturity' },
        { value: 'estimated_revenue', text: 'Sort by Revenue' }
    ];
    
    newOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        sortSelect.appendChild(optionElement);
    });
}

// Event Listeners
function bindEventListeners() {
    elements.analyzeBtn.addEventListener('click', analyzeURL);
    elements.urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeURL();
        }
    });

    elements.searchInput.addEventListener('input', debounce(function() {
        currentSearch = this.value;
        currentPage = 1;
        loadBusinesses();
        showSearchSuggestions(this.value);
    }, 500));

    elements.sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 1;
        loadBusinesses();
    });

    // Filter panel events
    document.addEventListener('click', function(e) {
        if (e.target.id === 'toggleFilters') {
            toggleFilterPanel();
        }
        if (e.target.id === 'applyFilters') {
            applyFilters();
        }
        if (e.target.id === 'clearFilters') {
            clearFilters();
        }
    });

    // Modal events
    elements.closeModal.addEventListener('click', closeModal);
    elements.businessModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });
}

// URL Analysis
async function analyzeURL() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    if (!serverConnected) {
        showError('Server not connected. Please start the backend server first.');
        return;
    }

    if (isLoading) {
        return;
    }

    try {
        isLoading = true;
        showLoading('Analyzing business... This may take 10-30 seconds');
        hideError();
        hideSuccess();
        
        const response = await apiCall('/analyze', {
            method: 'POST',
            body: JSON.stringify({ url })
        });

        if (response.success) {
            const dataPoints = response.data.data_points_extracted || 0;
            const analysisTime = response.analysis_time || 0;
            
            showSuccess(
                `Successfully analyzed ${response.data.company_name}! ` +
                `Extracted ${dataPoints} data points in ${analysisTime}s`
            );
            
            elements.urlInput.value = '';
            
            await Promise.all([
                loadBusinesses(),
                loadStats()
            ]);
            
            if (response.data.id) {
                setTimeout(() => {
                    viewBusiness(response.data.id);
                }, 2000);
            }
        } else {
            showError(response.error);
        }
    } catch (error) {
        showError(`Analysis failed: ${error.message}`);
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// Business Loading
async function loadBusinesses() {
    if (!serverConnected) {
        return;
    }
    
    try {
        const params = new URLSearchParams({
            search: currentSearch,
            sort: currentSort,
            page: currentPage,
            per_page: 12,
            ...currentFilters
        });

        const response = await apiCall(`/businesses?${params}`);

        if (response.success) {
            displayBusinesses(response.businesses);
            
            const count = response.pagination.total_items;
            elements.businessCount.textContent = `${count} business${count !== 1 ? 'es' : ''} found`;
            
            if (count === 0) {
                elements.emptyState.style.display = 'flex';
                elements.businessGrid.style.display = 'none';
            } else {
                elements.emptyState.style.display = 'none';
                elements.businessGrid.style.display = 'grid';
            }
            
            updatePagination(response.pagination);
        }
    } catch (error) {
        console.error('Failed to load businesses:', error);
        showError('Failed to load businesses. ' + error.message);
    }
}

// Business Display
function displayBusinesses(businesses) {
    elements.businessGrid.innerHTML = '';

    businesses.forEach(business => {
        const card = createBusinessCard(business);
        elements.businessGrid.appendChild(card);
    });
}

// Business Card
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'business-card';
    
    const companyName = business.company_name || 'Unknown Company';
    const businessType = business.business_type || 'Unknown';
    const industry = business.industry || 'Unknown';
    const location = business.location || 'Unknown';
    const foundedYear = business.founded_year || 'Unknown';
    const description = business.description || 'No description available';
    const businessModel = business.business_model || 'Unknown';
    const competitiveAdvantages = business.competitive_advantages || 'Not specified';

    card.innerHTML = `
        <div class="card-header">
            <div class="company-info">
                <h3>${escapeHtml(companyName)}</h3>
                <div class="business-meta">
                    <span class="business-type">${escapeHtml(businessType)}</span>
                    <span class="business-industry">${escapeHtml(industry)}</span>
                    <span class="business-model">${escapeHtml(businessModel)}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn insights-btn" onclick="viewBusinessInsights(${business.id})" title="View Insights">
                    <i class="fas fa-lightbulb"></i>
                </button>
                <button class="action-btn view-btn" onclick="viewBusiness(${business.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn visit-btn" onclick="visitWebsite('${business.url}')" title="Visit Website">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteBusiness(${business.id}, '${escapeHtml(companyName)}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <div class="card-description">
            <p>${escapeHtml(description.substring(0, 120))}${description.length > 120 ? '...' : ''}</p>
        </div>
        
        <div class="card-details">
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(location)}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>Founded ${escapeHtml(foundedYear)}</span>
            </div>
        </div>
        
        <div class="card-insights">
            <div class="competitive-advantage">
                <i class="fas fa-trophy"></i>
                <span>${escapeHtml(competitiveAdvantages.substring(0, 100))}${competitiveAdvantages.length > 100 ? '...' : ''}</span>
            </div>
        </div>
    `;

    return card;
}

// Business View
async function viewBusiness(businessId) {
    if (!serverConnected) {
        showError('Server not connected');
        return;
    }
    
    try {
        const response = await apiCall(`/business/${businessId}`);
        
        if (response.success) {
            showBusinessModal(response.business);
        }
    } catch (error) {
        showError(`Failed to load business details: ${error.message}`);
    }
}

// Business Modal
function showBusinessModal(business) {
    elements.modalTitle.textContent = business.company_name || 'Business Details';
    
    elements.modalContent.innerHTML = `
        <div class="modal-tabs">
            <button class="tab-btn active" onclick="showModalTab('overview')">Overview</button>
            <button class="tab-btn" onclick="showModalTab('insights')">Insights</button>
            <button class="tab-btn" onclick="showModalTab('competitive')">Competitive</button>
            <button class="tab-btn" onclick="showModalTab('operations')">Operations</button>
        </div>
        
        <div class="modal-tab-content">
            <div id="overview-tab" class="tab-content active">
                ${createOverviewTab(business)}
            </div>
            <div id="insights-tab" class="tab-content">
                ${createInsightsTab(business)}
            </div>
            <div id="competitive-tab" class="tab-content">
                ${createCompetitiveTab(business)}
            </div>
            <div id="operations-tab" class="tab-content">
                ${createOperationsTab(business)}
            </div>
        </div>
    `;

    elements.deleteBusinessBtn.onclick = () => deleteBusiness(business.id, business.company_name);
    elements.visitWebsiteBtn.onclick = () => visitWebsite(business.url);

    elements.businessModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createOverviewTab(business) {
    return `
        <div class="detail-grid">
            <div class="detail-section">
                <h4><i class="fas fa-building"></i> Company Information</h4>
                <div class="detail-row">
                    <strong>Name:</strong>
                    <span>${escapeHtml(business.company_name || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Type:</strong>
                    <span>${escapeHtml(business.business_type || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Industry:</strong>
                    <span>${escapeHtml(business.industry || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Business Model:</strong>
                    <span>${escapeHtml(business.business_model || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Location:</strong>
                    <span>${escapeHtml(business.location || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Founded:</strong>
                    <span>${escapeHtml(business.founded_year || 'N/A')}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-chart-line"></i> Business Metrics</h4>
                <div class="detail-row">
                    <strong>Company Size:</strong>
                    <span>${escapeHtml(business.company_size || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Employee Count:</strong>
                    <span>${escapeHtml(business.employee_count || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Estimated Revenue:</strong>
                    <span>${escapeHtml(business.estimated_revenue || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Target Market:</strong>
                    <span>${escapeHtml(business.target_market || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Market Focus:</strong>
                    <span>${escapeHtml(business.market_focus || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Business Maturity:</strong>
                    <span>${escapeHtml(business.business_maturity || 'N/A')}</span>
                </div>
            </div>
        </div>
    `;
}

function createInsightsTab(business) {
    return `
        <div class="detail-grid">
            <div class="detail-section full-width">
                <h4><i class="fas fa-file-text"></i> Business Description</h4>
                <p>${escapeHtml(business.description || 'No description available')}</p>
            </div>

            <div class="detail-section full-width">
                <h4><i class="fas fa-lightbulb"></i> Business Summary</h4>
                <p>${escapeHtml(business.summary || 'No summary available')}</p>
            </div>

            <div class="detail-section full-width">
                <h4><i class="fas fa-newspaper"></i> Recent Activities & News</h4>
                <p>${escapeHtml(business.recent_news || 'No recent activities found')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-users"></i> Key Leadership</h4>
                <p>${escapeHtml(business.key_executives || 'Leadership information not available')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-trophy"></i> Awards & Recognition</h4>
                <p>${escapeHtml(business.awards_recognition || 'No awards or recognition mentioned')}</p>
            </div>

            <div class="detail-section full-width">
                <h4><i class="fas fa-tags"></i> Product Categories</h4>
                <p>${escapeHtml(business.product_categories || 'Product categories not specified')}</p>
            </div>
        </div>
    `;
}

function createCompetitiveTab(business) {
    return `
        <div class="detail-grid">
            <div class="detail-section full-width">
                <h4><i class="fas fa-star"></i> Competitive Advantages</h4>
                <p>${escapeHtml(business.competitive_advantages || 'Competitive advantages not clearly specified')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-handshake"></i> Strategic Partnerships</h4>
                <p>${escapeHtml(business.partnerships || 'No partnerships mentioned')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-certificate"></i> Certifications & Compliance</h4>
                <p>${escapeHtml(business.certifications || 'No certifications mentioned')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-chart-line"></i> Market Position</h4>
                <p><strong>Market Focus:</strong> ${escapeHtml(business.market_focus || 'Unknown')}</p>
                <p><strong>Business Maturity:</strong> ${escapeHtml(business.business_maturity || 'Unknown')}</p>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-bullseye"></i> Target Market</h4>
                <p>${escapeHtml(business.target_market || 'General market')}</p>
            </div>

            <div class="detail-section full-width">
                <h4><i class="fas fa-comments"></i> Client Testimonials</h4>
                <p>${escapeHtml(business.client_testimonials || 'No client testimonials available')}</p>
            </div>
        </div>
    `;
}

function createOperationsTab(business) {
    return `
        <div class="detail-grid">
            <div class="detail-section">
                <h4><i class="fas fa-cogs"></i> Services & Products</h4>
                <div class="detail-row">
                    <strong>Key Services:</strong>
                    <span>${escapeHtml(business.key_services || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Product Categories:</strong>
                    <span>${escapeHtml(business.product_categories || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Technologies:</strong>
                    <span>${escapeHtml(business.technologies || 'N/A')}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-address-book"></i> Contact & Social</h4>
                <div class="detail-row">
                    <strong>Contact Info:</strong>
                    <span>${escapeHtml(business.contact_info || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <strong>Social Media:</strong>
                    <span>${escapeHtml(business.social_media || 'N/A')}</span>
                </div>
            </div>

            <div class="detail-section full-width">
                <h4><i class="fas fa-info-circle"></i> Analysis Meta</h4>
                <div class="analysis-meta">
                    <strong>URL:</strong> <a href="${business.url}" target="_blank">${business.url}</a><br>
                    <strong>Data Completeness:</strong> ${business.data_completeness || 'N/A'}%<br>
                    <strong>Last Updated:</strong> ${business.last_updated_formatted || 'N/A'}<br>
                    <strong>Scraped Date:</strong> ${business.scraped_date_formatted || 'N/A'}
                </div>
            </div>
        </div>
    `;
}

// Business Insights
async function viewBusinessInsights(businessId) {
    if (!serverConnected) {
        showError('Server not connected');
        return;
    }
    
    try {
        const response = await apiCall(`/business/${businessId}/insights`);
        
        if (response.success) {
            showInsightsModal(response.insights);
        }
    } catch (error) {
        showError(`Failed to load business insights: ${error.message}`);
    }
}

function showInsightsModal(insights) {
    const modal = document.createElement('div');
    modal.className = 'modal insights-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Business Insights</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="insights-grid">
                    ${createInsightsContent(insights)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createInsightsContent(insights) {
    return `
        <div class="insight-section">
            <h3>Company Overview</h3>
            <div class="insight-content">
                <p><strong>Name:</strong> ${insights.company_overview.name}</p>
                <p><strong>Industry:</strong> ${insights.company_overview.industry}</p>
                <p><strong>Founded:</strong> ${insights.company_overview.founded}</p>
                <p><strong>Size:</strong> ${insights.company_overview.size}</p>
                <p><strong>Location:</strong> ${insights.company_overview.location}</p>
            </div>
        </div>
        
        <div class="insight-section">
            <h3>Business Intelligence</h3>
            <div class="insight-content">
                <p><strong>Business Model:</strong> ${insights.business_analysis.business_model}</p>
                <p><strong>Target Market:</strong> ${insights.business_analysis.target_market}</p>
                <p><strong>Market Position:</strong> ${insights.business_analysis.market_position}</p>
                <p><strong>Business Maturity:</strong> ${insights.business_analysis.business_maturity}</p>
            </div>
        </div>
        
        <div class="insight-section">
            <h3>Competitive Analysis</h3>
            <div class="insight-content">
                <p><strong>Key Advantages:</strong> ${insights.business_analysis.competitive_advantages}</p>
            </div>
        </div>
        
        <div class="insight-section">
            <h3>Recent Activities & News</h3>
            <div class="insight-content">
                <p><strong>Recent Updates:</strong> ${insights.recent_activity.recent_news}</p>
                <p><strong>Awards & Recognition:</strong> ${insights.recent_activity.awards}</p>
                <p><strong>Client Feedback:</strong> ${insights.recent_activity.testimonials}</p>
            </div>
        </div>
        
        <div class="insight-section">
            <h3>Contact Information</h3>
            <div class="insight-content">
                <p><strong>Website:</strong> <a href="${insights.contact_and_social.website}" target="_blank">${insights.contact_and_social.website}</a></p>
                <p><strong>Contact:</strong> ${insights.contact_and_social.contact_info}</p>
                <p><strong>Social Media:</strong> ${insights.contact_and_social.social_media}</p>
            </div>
        </div>
    `;
}

// Statistics Loading
async function loadStats() {
    if (!serverConnected) {
        return;
    }
    
    try {
        const response = await apiCall('/analytics/dashboard');
        
        if (response.success) {
            updateDashboardStats(response.dashboard);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function updateDashboardStats(dashboard) {
    const overview = dashboard.overview;
    
    document.getElementById('totalBusinessesStat').textContent = overview.total_businesses;
    document.getElementById('recentAdditionsStat').textContent = overview.recent_additions;
    
    if (elements.totalBusinesses) {
        elements.totalBusinesses.textContent = overview.total_businesses;
    }
}

// Filter Management
async function loadFilterOptions() {
    if (!serverConnected) {
        return;
    }
    
    try {
        const response = await apiCall('/filters/options');
        
        if (response.success) {
            filterOptions = response.options;
            populateFilterDropdowns();
        }
    } catch (error) {
        console.error('Failed to load filter options:', error);
    }
}

function populateFilterDropdowns() {
    const dropdowns = {
        'businessTypeFilter': filterOptions.business_types,
        'industryFilter': filterOptions.industries,
        'companySizeFilter': filterOptions.company_sizes,
        'locationFilter': filterOptions.locations
    };
    
    Object.entries(dropdowns).forEach(([id, options]) => {
        const select = document.getElementById(id);
        if (select) {
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
        }
    });
}

function toggleFilterPanel() {
    const filterOptions = document.getElementById('filterOptions');
    if (filterOptions.style.display === 'none') {
        filterOptions.style.display = 'block';
    } else {
        filterOptions.style.display = 'none';
    }
}

function applyFilters() {
    currentFilters = {};
    
    const businessType = document.getElementById('businessTypeFilter').value;
    const industry = document.getElementById('industryFilter').value;
    const companySize = document.getElementById('companySizeFilter').value;
    const location = document.getElementById('locationFilter').value;
    
    if (businessType) currentFilters.business_type = businessType;
    if (industry) currentFilters.industry = industry;
    if (companySize) currentFilters.company_size = companySize;
    if (location) currentFilters.location = location;
    
    currentPage = 1;
    loadBusinesses();
    
    document.getElementById('filterOptions').style.display = 'none';
}

function clearFilters() {
    currentFilters = {};
    
    document.getElementById('businessTypeFilter').value = '';
    document.getElementById('industryFilter').value = '';
    document.getElementById('companySizeFilter').value = '';
    document.getElementById('locationFilter').value = '';
    
    currentPage = 1;
    loadBusinesses();
}

// Modal Tab Management
function showModalTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    
    event.target.classList.add('active');
}

// Search Suggestions
function showSearchSuggestions(query) {
    if (query.length < 2) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }
    
    const suggestions = [
        'Technology companies',
        'SaaS businesses',
        'Fintech startups',
        'Healthcare companies',
        'E-commerce platforms'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
    
    const suggestionsDiv = document.getElementById('searchSuggestions');
    suggestionsDiv.innerHTML = suggestions.map(s => 
        `<div class="suggestion-item" onclick="selectSuggestion('${s}')">${s}</div>`
    ).join('');
    
    suggestionsDiv.style.display = suggestions.length > 0 ? 'block' : 'none';
}

function selectSuggestion(suggestion) {
    elements.searchInput.value = suggestion;
    currentSearch = suggestion;
    currentPage = 1;
    loadBusinesses();
    document.getElementById('searchSuggestions').style.display = 'none';
}

// Helper functions
function closeModal() {
    elements.businessModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    document.querySelectorAll('.insights-modal').forEach(modal => {
        modal.remove();
    });
}

function visitWebsite(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

async function deleteBusiness(businessId, companyName) {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
        return;
    }
    
    if (!serverConnected) {
        showError('Server not connected');
        return;
    }

    try {
        const response = await apiCall(`/business/${businessId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showSuccess(`Successfully deleted ${companyName}`);
            closeModal();
            loadBusinesses();
            loadStats();
        }
    } catch (error) {
        showError(`Failed to delete business: ${error.message}`);
    }
}

function updatePagination(pagination) {
    // Placeholder for pagination UI
}

// UI Helper Functions
function showLoading(message) {
    elements.loadingState.querySelector('span').textContent = message;
    elements.loadingState.style.display = 'flex';
    elements.analyzeBtn.disabled = true;
}

function hideLoading() {
    elements.loadingState.style.display = 'none';
    elements.analyzeBtn.disabled = false;
}

function showError(message) {
    elements.errorState.style.display = 'block';
    elements.errorMessage.textContent = message;
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    elements.errorState.style.display = 'none';
}

function showSuccess(message) {
    elements.successState.style.display = 'block';
    elements.successMessage.textContent = message;
    
    setTimeout(() => {
        hideSuccess();
    }, 3000);
}

function hideSuccess() {
    elements.successState.style.display = 'none';
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global functions for onclick handlers
window.viewBusiness = viewBusiness;
window.viewBusinessInsights = viewBusinessInsights;
window.visitWebsite = visitWebsite;
window.deleteBusiness = deleteBusiness;
window.showModalTab = showModalTab;
window.selectSuggestion = selectSuggestion;
window.retryConnection = retryConnection;

console.log('✅ Business Analyzer Frontend Ready with Enhanced Error Handling!');