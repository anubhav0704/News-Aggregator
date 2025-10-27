// Wait for the HTML document to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. CONFIGURATION & SELECTORS ---
    
    // ⚠️ PASTE YOUR GNEWS API KEY HERE!
    const API_KEY = 'aa478943e85725d8278c28be17272332';
    const GNEWS_API_URL = `https://gnews.io/api/v4/search?lang=en&token=${API_KEY}`;

    // Get references to the HTML elements we need to interact with
    const mainContent = document.querySelector('.main-content');
    const sidebarList = document.querySelector('.widget-post-list');
    const navLinks = document.querySelectorAll('.main-nav a');
    const siteTitle = document.querySelector('.site-title a');
    const dateElement = document.getElementById('current-date');

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
            const response = await fetch(`${GNEWS_API_URL}&q=${query}&max=${max}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.articles;
        } catch (error) {
            console.error("Error fetching news:", error);
            // Show a user-friendly error message
            mainContent.innerHTML = `<div class="error-message">Could not fetch news. Please check your API key or try again later.</div>`;
            return null;
        }
    }

    /**
     * Renders the homepage layout with a hero grid.
     * @param {Array} articles - An array of article objects.
     */
    function renderHomepage(articles) {
        if (!articles || articles.length < 3) {
            mainContent.innerHTML = `<div class="error-message">Not enough articles to display homepage.</div>`;
            return;
        }

        // Article 1 (Main Hero)
        const heroArticle = articles[0];
        // Articles 2 & 3 (Secondary Heroes)
        const secondaryArticle1 = articles[1];
        const secondaryArticle2 = articles[2];

        // Use template literals to build the HTML
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
            mainContent.innerHTML = `<h2 class="page-heading">${categoryName}</h2><p>No articles found for this category.</p>`;
            return;
        }

        // Create an HTML string for each article and join them together
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
     * @param {Array} articles - An array of article objects.
     */
    async function renderSidebar() {
        // Fetch 4 "breaking-news" articles for the sidebar
        const articles = await fetchNews('breaking-news', 4);
        
        if (!articles) {
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
     * This avoids code duplication.
     * @param {object} article - An article object.
     * @param {'hero'|'secondary'|'list'} type - The type of card to build.
     * @returns {string} The HTML string for the card.
     */
    function createArticleCard(article, type) {
        // Use a placeholder if no image is available
        const imageUrl = article.image || 'https://via.placeholder.com/400x220?text=No+Image';
        const author = article.source.name || 'Unknown Source';

        // Different HTML structures based on card type
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


    // --- 3. EVENT LISTENERS ---

    /**
     * Handles clicks on the navigation links.
     * @param {Event} e - The click event.
     */
    async function handleNavClick(e) {
        e.preventDefault(); // Stop the browser from following the '#' link
        const link = e.target;
        
        // Get the category from the 'data-category' attribute
        const category = link.dataset.category;
        if (!category) return; // Exit if the click wasn't on a valid link
        
        // Update the 'active' class on nav links
        updateActiveLink(link);
        
        if (category === 'home') {
            // Load homepage
            const articles = await fetchNews('technology', 9); // 'technology' is our default homepage topic
            renderHomepage(articles);
        } else {
            // Load category page
            const articles = await fetchNews(category, 9);
            renderCategoryPage(articles, category);
        }
    }
    
    /**
     * Helper function to update which nav link is 'active'.
     * @param {HTMLElement} activeLink - The link element to set as active.
     */
    function updateActiveLink(activeLink) {
        // Remove 'active' from all nav links
        navLinks.forEach(link => link.classList.remove('active'));
        // Add 'active' to the one that was clicked
        activeLink.classList.add('active');
    }

    // Attach click event listeners to all nav links
    navLinks.forEach(link => link.addEventListener('click', handleNavClick));

    // Attach click event listener to the site title to go home
    siteTitle.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveLink(document.querySelector('.main-nav a[data-category="home"]'));
        // Load homepage
        fetchNews('technology', 9).then(renderHomepage);
    });

    
    // --- 4. INITIALIZATION ---

    /**
     * Loads the initial content when the page first loads.
     */
    function initializePage() {
        // Load the sidebar stories
        renderSidebar();
        
        // Load the homepage content
        fetchNews('technology', 9).then(renderHomepage);
    }

    initializePage();
});
