// Wait for the HTML document to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. CONFIGURATION & SELECTORS ---
    
    // I have added the MediaStack API key you provided.
    // This key will be blocked soon. You must generate a new one.
    const API_KEY = 'c7bc649e232918b71f3fc7c164d97fa1';
    
    // UPDATED: New API URL for MediaStack
    // Note: Free plans must use http, not https
    const MEDIASTACK_API_URL = `http://api.mediastack.com/v1/news?access_key=${API_KEY}`;

    // Get references to the HTML elements
    const mainContent = document.querySelector('.main-content');
    const sidebarList = document.querySelector('.widget-post-list');
    const navLinks = document.querySelectorAll('.main-nav a');
    const siteTitle = document.querySelector('.site-title a');
    const dateElement = document.getElementById('current-date');
    const categoryWidgets = document.querySelectorAll('.category-widget');

    // Update the date on the page
    dateElement.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    
    // --- 2. CORE FUNCTIONS (Fetching & Rendering) ---

    /**
     * UPDATED: Fetches news from the MediaStack API.
     * @param {string} query - The search term (e.g., "technology")
     * @param {number} [max=9] - The number of articles to fetch
     * @returns {Promise<Array|null>} A promise that resolves to an array of articles or null if an error occurs.
     */
    async function fetchNews(query, max = 9) {
        mainContent.innerHTML = '<div class="loader"></div>';
        
        try {
            // UPDATED: MediaStack uses 'keywords' and 'limit'
            const formattedQuery = encodeURIComponent(query);
            // We search in English, sort by popularity
            const response = await fetch(`${MEDIASTACK_API_URL}&keywords=${formattedQuery}&limit=${max}&languages=en&sort=popularity`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            // UPDATED: MediaStack nests articles in a 'data' array
            return data.data; 
        } catch (error) {
            console.error("Error fetching news:", error);
            mainContent.innerHTML = `<div class="error-message">Could not fetch news. This is often due to an invalid API key, exceeding the daily request limit, or an http/https error.</div>`;
            return null;
        }
    }

    /**
     * Renders the homepage layout with a hero grid.
     * @param {Array} articles - An array of article objects.
     */
    function renderHomepage(articles) {
        if (!articles || articles.length < 3) {
            mainContent.innerHTML = `<div class="error-message">Not enough articles to display the homepage. The API may be having issues or the query returned no results.</div>`;
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
        // UPDATED: MediaStack's 'general' category is good for top stories
        const articles = await fetchNews('general', 4);
        
        if (!articles || articles.length === 0) {
            sidebarList.innerHTML = "<p>Could not load stories.</p>";
            return;
        }

        // UPDATED: `article.title` and `article.url` are the same
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
     * UPDATED: A helper function to create article cards from MediaStack data.
     * @param {object} article - An article object.
     * @param {'hero'|'secondary'|'list'} type - The type of card to build.
     * @returns {string} The HTML string for the card.
     */
    function createArticleCard(article, type) {
        // UPDATED: MediaStack fields
        const imageUrl = article.image || 'https://via.placeholder.com/400x220?text=No+Image';
        const author = article.author || article.source || 'Unknown Source';
        const title = article.title;
        const description = article.description;
        const url = article.url;
        const category = article.category;
        const publishedAt = article.published_at;

        if (type === 'hero') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${title}">
                    <div class="article-content">
                        <span class="article-category">${category}</span>
                        <h3><a href="${url}" target="_blank">${title}</a></h3>
                        <span class="article-meta">By ${author} / ${new Date(publishedAt).toLocaleDateString()}</span>
                        <p class="article-excerpt">${description}</p>
                    </div>
                </article>
            `;
        }
        
        if (type === 'secondary') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${title}">
                    <div class="article-content">
                        <span class="article-category">${category}</span>
                        <h3><a href="${url}" target="_blank">${title}</a></h3>
                        <span class="article-meta">${new Date(publishedAt).toLocaleDateString()}</span>
                    </div>
                </article>
            `;
        }
        
        if (type === 'list') {
            return `
                <article class="article-card">
                    <img src="${imageUrl}" alt="${title}">
                    <div class="article-content">
                        <span class="article-category">${category}</span>
                        <h3><a href="${url}" target="_blank">${title}</a></h3>
                        <span class="article-meta">By ${author} / ${new Date(publishedAt).toLocaleDateString()}</span>
                        <p class="article-excerpt">${description}</p>
                    </div>
                </article>
            `;
        }
    }


    // --- 3. EVENT LISTENERS & NEW FUNCTIONS ---

    function updateSidebarWidgets(category) {
        categoryWidgets.forEach(widget => {
            widget.style.display = 'none';
        });

        if (category === 'home') {
            categoryWidgets.forEach(widget => {
                widget.style.display = 'block';
            });
        } else {
            const widgetToShow = document.querySelector(`#widget-${category}`);
            if (widgetToShow) {
                widgetToShow.style.display = 'block';
            }
        }
    }

    async function handleNavClick(e) {
        e.preventDefault(); 
        const link = e.target;
        
        const category = link.dataset.category;
        if (!category) return; 
        
        updateActiveLink(link);
        updateSidebarWidgets(category);

        if (category === 'home') {
            // UPDATED: 'general' is the best MediaStack query for homepage
            const articles = await fetchNews('general', 9);
            renderHomepage(articles);
        } else {
            const articles = await fetchNews(category, 9);
            renderCategoryPage(articles, category);
        }
    }
    
    function updateActiveLink(activeLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    navLinks.forEach(link => link.addEventListener('click', handleNavClick));

    siteTitle.addEventListener('click', (e) => {
        e.preventDefault();
        const homeLink = document.querySelector('.main-nav a[data-category="home"]');
        if (homeLink) {
            updateActiveLink(homeLink);
        }
        updateSidebarWidgets('home');
        // UPDATED: 'general' is the best MediaStack query for homepage
        fetchNews('general', 9).then(renderHomepage);
    });

    
    // --- 4. INITIALIZATION ---

    function initializePage() {
        renderSidebar();
        
        // UPDATED: 'general' is the best MediaStack query for homepage
        fetchNews('general', 9).then(renderHomepage);
        
        updateSidebarWidgets('home');
    }

    initializePage();
});
