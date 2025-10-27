// Wait for the HTML document to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. CONFIGURATION & SELECTORS ---
    
    // ⚠️ YOU MUST PASTE YOUR NEW, SECRET GNEWS API KEY HERE!
    const API_KEY = 'cb691f1ab5ca0ee92da1c87d18f14768';
    const GNEWS_API_URL = `https://gnews.io/api/v4/search?lang=en&token=${API_KEY}`;

    // Get references to the HTML elements
    const mainContent = document.querySelector('.main-content');
    const sidebarList = document.querySelector('.widget-post-list');
    const navLinks = document.querySelectorAll('.main-nav a');
    const siteTitle = document.querySelector('.site-title a');
    const dateElement = document.getElementById('current-date');
    
    // NEW selector for category widgets
    const categoryWidgets = document.querySelectorAll('.category-widget');

    // Update the date on the page
    dateElement.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    
    // --- 2. CORE FUNCTIONS (Fetching & Rendering) ---

    /**
     * Fetches news from the GNews API.
     * @param {string} query - The search term (e.g., "technology")
     * @param {number} [max=9] - The number of articles to fetch
     * @returns {Promise<Array|null>} A promise that resolves to an array of articles or null if an error occurs.
     */
    async function fetchNews(query, max = 9) {
        // Show a loading spinner while fetching
        mainContent.innerHTML = '<div class="loader"></div>';
        
        try {
            // Use encodeURIComponent to make the query safe for a URL
            const formattedQuery = encodeURIComponent(query);
            const response = await fetch(`${GNEWS_API_URL}&q=${formattedQuery}&max=${max}`);
            
            if (!response.ok) {
                // This will catch 401, 429, etc.
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.articles;
        } catch (error) {
            console.error("Error fetching news:", error);
            // Show a user-friendly error message
            mainContent.innerHTML = `<div class="error-message">Could not fetch news. This is often due to an invalid API key or exceeding the daily request limit.</div>`;
            return null;
        }
    }

    /**
     * Renders the homepage layout with a hero grid.
     * @param {Array} articles - An array of article objects.
     */
    function renderHomepage(articles) {
        if (!articles || articles.length < 3) {
            // If articles are null or too few, show the error
            mainContent.innerHTML = `<div class="error-message">Not enough articles to display the homepage. The API may be having issues.</div>`;
            return;
        }

        const heroArticle = articles[0];
        const secondaryArticle1 = articles[1];
        const secondaryArticle2 = articles[2];

        const html = `
            <div class="hero-grid">
                <div class="hero-main">
                    ${createArticleCard(heroArticle, 'hero')}
                </div>
                <div class="hero-secondary">
                    ${createArticleCard(secondaryArticle1, 'secondary')}
                </div>
                <div class="hero-secondary">
                    ${createArticleCard(secondaryArticle2, 'secondary')}
                </div>
            </div>
        `;
        mainContent.innerHTML = html;
    }

    /**
     * Renders a standard category page with a list of articles.
     * @param {Array} articles - An array of article objects.
     * @param {string} categoryName - The name of the category (e.g., "world")
     */
    function renderCategoryPage(articles, categoryName) {
        if (!articles || articles.length === 0) {
            mainContent.innerHTML = `<h2 class="page-heading">${categoryName} News</h2><p>No articles found for this category.</p>`;
            return;
        }

        const articlesHtml = articles
            .map(article => createArticleCard(article, 'list'))
            .join('');

        const html = `
            <h2 class="page-heading">${categoryName} News</h2>
            <div class="article-list">
                ${articlesHtml}
            </div>
        `;
        mainContent.innerHTML = html;
    }

    /**
     * Renders the sidebar with "Top Stories".
     */
    async function renderSidebar() {
        // Fetch 4 "breaking-news" articles for the sidebar
        const articles = await fetchNews('breaking-news', 4);
        
        if (!articles || articles.length === 0) {
            sidebarList.innerHTML = "<p>Could not load stories.</p>";
            return;
        }

        const html = articles.map(article => `
            <div class="widget-post">
                <img src="${article.image || 'https://via.placeholder.com/80'}" alt="Story image">
                <div>
                    <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                </div>
            </div>
        `).join('');
        
        sidebarList.innerHTML = html;
    }

    /**
     * A helper function to create the HTML for a single article card.
     * @param {object} article - An article object.
     * @param {'hero'|'secondary'|'list'} type - The type of card to build.
     * @returns {string} The HTML string for the card.
     */
    function createArticleCard(article, type) {
        const imageUrl = article.image || 'https://via.placeholder.com/400x220?text=No+Image';
        const author = article.source.name || 'Unknown Source';

        if (type === 'hero') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${article.title}">
                    <div class="article-content">
                        <span class="article-category">${article.source.name}</span>
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <span class="article-meta">By ${author} / ${new Date(article.publishedAt).toLocaleDateString()}</span>
                        <p class="article-excerpt">${article.description}</p>
                    </div>
                </article>
            `;
        }
        
        if (type === 'secondary') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${article.title}">
                    <div class="article-content">
                        <span class="article-category">${article.source.name}</span>
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <span class="article-meta">${new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                </article>
            `;
        }
        
        if (type === 'list') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${article.title}">
                    <div class="article-content">
                        <span class="article-category">${article.source.name}</span>
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <span class="article-meta">By ${author} / ${new Date(article.publishedAt).toLocaleDateString()}</span>
                        <p class="article-excerpt">${article.description}</p>
                    </div>
                </article>
            `;
        }
    }


    // --- 3. EVENT LISTENERS & NEW FUNCTIONS ---

    /**
     * NEW FUNCTION: Shows/hides sidebar widgets based on category
     * @param {string} category - The category to show (e.g., "world", "home")
     */
    function updateSidebarWidgets(category) {
        // Hide all category-specific widgets
        categoryWidgets.forEach(widget => {
            widget.style.display = 'none';
        });

        if (category === 'home') {
            // On the homepage, show all of them
            categoryWidgets.forEach(widget => {
                widget.style.display = 'block';
            });
        } else {
            // On a specific category page, show only that one
            const widgetToShow = document.querySelector(`#widget-${category}`);
            if (widgetToShow) {
                widgetToShow.style.display = 'block';
            }
        }
    }


    /**
     * Handles clicks on the navigation links.
     * @param {Event} e - The click event.
     */
    async function handleNavClick(e) {
        e.preventDefault(); 
        const link = e.target;
        
        const category = link.dataset.category;
        if (!category) return; 
        
        updateActiveLink(link);
        updateSidebarWidgets(category); // <-- ADDED THIS CALL

        if (category === 'home') {
            const articles = await fetchNews('breaking-news OR top stories', 9);
            renderHomepage(articles);
        } else {
            const articles = await fetchNews(category, 9);
            renderCategoryPage(articles, category);
        }
    }
    
    /**
     * Helper function to update which nav link is 'active'.
     * @param {HTMLElement} activeLink - The link element to set as active.
     */
    function updateActiveLink(activeLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    // Attach click event listeners to all nav links
    navLinks.forEach(link => link.addEventListener('click', handleNavClick));

    // Attach click event listener to the site title to go home
    siteTitle.addEventListener('click', (e) => {
        e.preventDefault();
        const homeLink = document.querySelector('.main-nav a[data-category="home"]');
        if (homeLink) {
            updateActiveLink(homeLink);
        }
        updateSidebarWidgets('home'); // <-- ADDED THIS CALL
        fetchNews('breaking-news OR top stories', 9).then(renderHomepage);
    });

    
    // --- 4. INITIALIZATION ---

    /**
     * Loads the initial content when the page first loads.
     */
    function initializePage() {
        // Load the sidebar stories
        renderSidebar();
        
        // Load the homepage content
        fetchNews('breaking-news OR top stories', 9).then(renderHomepage);
        
        // Show all widgets on initial (home) load
        updateSidebarWidgets('home'); // <-- ADDED THIS CALL
    }

    // Start the application
    initializePage();
});
