// 🔧 FIXED script.js - Replace your entire frontend/script.js with this

// Global variables
let currentPage = 1;
let currentSearch = '';
let currentSort = 'scraped_date';
let currentFilters = {};
let isLoading = false;

// DOM elements
const elements = {
    urlInput: null,
    analyzeBtn: null,
    statusMessage: null,
    businessGrid: null,
    businessCount: null,
    sortSelect: null,
    searchInput: null,
    businessModal: null,
    closeModal: null
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App initializing...');
    initializeElements();
    createUI();
    bindEventListeners();
    loadBusinesses();
});

// Initialize DOM elements
function initializeElements() {
    elements.urlInput = document.getElementById('urlInput');
    elements.analyzeBtn = document.getElementById('analyzeBtn');
    elements.statusMessage = document.getElementById('statusMessage');
    elements.businessGrid = document.getElementById('businessGrid');
    elements.businessCount = document.getElementById('businessCount');
    elements.sortSelect = document.getElementById('sortSelect');
    elements.businessModal = document.getElementById('businessModal');
    elements.closeModal = document.getElementById('closeModal');
    
    console.log('✅ DOM elements initialized');
}

// Create UI components
function createUI() {
    createFilterPanel();
    createDashboardStats();
    createAnalysisProgress();
    createSearchInput(); // This creates the search input
    enhanceSortSelect();
}

// FIXED: Create search input properly
function createSearchInput() {
    const controlsDiv = document.querySelector('.controls');
    if (!controlsDiv) {
        console.error('❌ Controls div not found!');
        return;
    }
    
    // Remove existing search input if it exists
    const existingSearch = document.getElementById('searchInput');
    if (existingSearch) {
        existingSearch.parentElement.remove();
    }
    
    // Create search input container
    const searchGroup = document.createElement('div');
    searchGroup.className = 'search-group';
    searchGroup.innerHTML = `
        <i class="fas fa-search search-icon"></i>
        <input 
            type="text" 
            id="searchInput" 
            placeholder="Search companies, industries, locations..." 
            class="search-input"
            autocomplete="off"
        >
        <div id="searchSuggestions" class="search-suggestions" style="display: none;"></div>
    `;
    
    // Insert at the beginning of controls
    const firstDiv = controlsDiv.querySelector('div');
    if (firstDiv) {
        controlsDiv.insertBefore(searchGroup, firstDiv);
    } else {
        controlsDiv.appendChild(searchGroup);
    }
    
    // Update elements reference
    elements.searchInput = document.getElementById('searchInput');
    console.log('✅ Search input created successfully');
}

// FIXED: Enhanced search event listener
function bindEventListeners() {
    console.log('🔗 Binding event listeners...');
    
    // Analyze button event
    if (elements.analyzeBtn) {
        elements.analyzeBtn.addEventListener('click', analyzeURL);
    }
    
    // URL input enter key event
    if (elements.urlInput) {
        elements.urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                analyzeURL();
            }
        });
    }

    // FIXED: Search input event with proper debouncing
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(event) {
                try {
                    const searchValue = event.target.value.trim();
                    console.log('🔍 Searching for:', searchValue);
                    currentSearch = searchValue;
                    currentPage = 1;
                    loadBusinesses();
                    
                    // Hide suggestions when empty
                    const suggestions = document.getElementById('searchSuggestions');
                    if (suggestions) {
                        suggestions.style.display = 'none';
                    }
                } catch (error) {
                    console.error('❌ Search input error:', error);
                }
            }, 300));
            
            // Clear search on escape
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    currentSearch = '';
                    loadBusinesses();
                }
            });
            
            console.log('✅ Search event listener attached successfully');
        } else {
            console.error('❌ Search input not found after creation');
        }
    }, 100);

    // Sort select event
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1;
            loadBusinesses();
        });
    }

    // Filter panel events
    document.addEventListener('click', function(e) {
        try {
            if (e.target && e.target.id === 'toggleFilters') {
                toggleFilterPanel();
            }
            if (e.target && e.target.id === 'applyFilters') {
                applyFilters();
            }
            if (e.target && e.target.id === 'clearFilters') {
                clearFilters();
            }
        } catch (error) {
            console.error('❌ Filter event error:', error);
        }
    });

    // Modal events
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    if (elements.businessModal) {
        elements.businessModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// FIXED: Business card without completion percentage
function createBusinessCard(business) {
    const card = document.createElement('div');
    card.className = 'business-card fade-in';
    
    const companyName = business.company_name || 'Unknown Company';
    const businessType = business.business_type || 'Unknown';
    const industry = business.industry || 'Unknown';
    const location = business.location || 'Unknown';
    const foundedYear = business.founded_year || 'Unknown';
    const description = business.description || 'No description available';
    const businessModel = business.business_model || 'Unknown';

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
    `;

    return card;
}

// FIXED: Load businesses with proper search
async function loadBusinesses() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        console.log('📊 Loading businesses...', { currentSearch, currentSort, currentPage });
        
        showLoading(true);
        
        const params = new URLSearchParams({
            page: currentPage,
            sort_by: currentSort,
            search: currentSearch || ''
        });
        
        // Add filters to params
        Object.keys(currentFilters).forEach(key => {
            if (currentFilters[key]) {
                params.append(key, currentFilters[key]);
            }
        });
        
        const response = await fetch(`/api/businesses?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayBusinesses(result.data);
            updatePagination(result.pagination);
            updateBusinessCount(result.pagination.total_items);
            console.log(`✅ Loaded ${result.data.length} businesses`);
        } else {
            console.error('❌ Failed to load businesses:', result.error);
            showError('Failed to load businesses');
        }
        
    } catch (error) {
        console.error('❌ Error loading businesses:', error);
        showError('Error loading businesses');
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

// Analyze URL function
async function analyzeURL() {
    const url = elements.urlInput.value.trim();
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    try {
        showAnalysisProgress(true);
        
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('Website analyzed successfully!');
            elements.urlInput.value = '';
            currentPage = 1;
            loadBusinesses(); // Reload to show new business
        } else {
            showError(result.error || 'Failed to analyze website');
        }
    } catch (error) {
        console.error('❌ Analysis error:', error);
        showError('Error analyzing website');
    } finally {
        showAnalysisProgress(false);
    }
}

// Display functions
function displayBusinesses(businesses) {
    const grid = elements.businessGrid;
    
    if (!businesses || businesses.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No businesses found</h3>
                <p>${currentSearch ? 'Try adjusting your search terms' : 'Start by analyzing some business websites'}</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    businesses.forEach(business => {
        const card = createBusinessCard(business);
        grid.appendChild(card);
    });
}

function updateBusinessCount(count) {
    if (elements.businessCount) {
        elements.businessCount.textContent = `${count} businesses found`;
    }
}

function updatePagination(pagination) {
    // Add pagination controls if needed
    console.log('📄 Pagination:', pagination);
}

// Utility functions
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
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showLoading(show) {
    const grid = elements.businessGrid;
    if (show) {
        grid.innerHTML = '<div class="text-center loading">🔄 Loading businesses...</div>';
    }
}

function showError(message) {
    showStatusMessage(message, 'error');
}

function showSuccess(message) {
    showStatusMessage(message, 'success');
}

function showStatusMessage(message, type) {
    if (elements.statusMessage) {
        elements.statusMessage.className = `status-message ${type}`;
        elements.statusMessage.innerHTML = `
            <div class="loading-spinner" style="display: ${type === 'loading' ? 'block' : 'none'}"></div>
            <span>${message}</span>
        `;
        elements.statusMessage.style.display = 'flex';
        
        if (type !== 'loading') {
            setTimeout(() => {
                elements.statusMessage.style.display = 'none';
            }, 5000);
        }
    }
}

function showAnalysisProgress(show) {
    // Simple progress indication
    if (show) {
        showStatusMessage('Analyzing website...', 'loading');
    } else {
        elements.statusMessage.style.display = 'none';
    }
}

// Business action functions
function viewBusiness(id) {
    console.log('👁️ View business:', id);
    // Add modal functionality here if needed
}

function viewBusinessInsights(id) {
    console.log('💡 View insights:', id);
    // Add insights modal functionality here if needed
}

function visitWebsite(url) {
    window.open(url, '_blank');
}

async function deleteBusiness(id, name) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        try {
            const response = await fetch(`/api/businesses/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Business deleted successfully');
                loadBusinesses(); // Reload list
            } else {
                showError(result.error || 'Failed to delete business');
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            showError('Error deleting business');
        }
    }
}

// Modal functions
function closeModal() {
    if (elements.businessModal) {
        elements.businessModal.style.display = 'none';
    }
}

// Placeholder functions for UI components
function createFilterPanel() {
    console.log('📋 Filter panel created');
}

function createDashboardStats() {
    console.log('📊 Dashboard stats created');
}

function createAnalysisProgress() {
    console.log('📈 Analysis progress created');
}

function enhanceSortSelect() {
    console.log('🔄 Sort select enhanced');
}

function toggleFilterPanel() {
    console.log('🎛️ Toggle filter panel');
}

function applyFilters() {
    console.log('✅ Apply filters');
}

function clearFilters() {
    currentFilters = {};
    currentSearch = '';
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
    loadBusinesses();
}

// Initialize everything
console.log('📝 Script loaded successfully');