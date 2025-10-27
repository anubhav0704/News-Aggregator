// Wait for the HTML document to be fully loaded before running script

document.addEventListener("DOMContentLoaded", () => {



    // --- 1. CONFIGURATION & SELECTORS ---

    

    // ⚠️ YOU MUST PASTE YOUR NEW, SECRET GNEWS API KEY HERE!

    const API_KEY = 'c7da1460de1b2095d6ee7fa958cdb5cc';

    const GNEWS_API_URL = `https://gnews.io/api/v4/search?lang=en&token=${API_KEY}`;



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



    async function fetchNews(query, max = 9) {

        mainContent.innerHTML = '<div class="loader"></div>';

        

        try {

            const formattedQuery = encodeURIComponent(query);

            const response = await fetch(`${GNEWS_API_URL}&q=${formattedQuery}&max=${max}`);

            

            if (!response.ok) {

                throw new Error(`API Error: ${response.status} ${response.statusText}`);

            }

            const data = await response.json();

            return data.articles;

        } catch (error) {

            console.error("Error fetching news:", error);

            mainContent.innerHTML = `<div class="error-message">Could not fetch news. This is often due to an invalid API key or exceeding the daily request limit.</div>`;

            return null;

        }

    }



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



    async function renderSidebar() {

        // **FIXED:** Changed 'breaking-news' to a more reliable query

        const articles = await fetchNews('technology', 4);

        

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

            // **FIXED:** Changed to a more reliable query

            const articles = await fetchNews('world', 9);

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

        // **FIXED:** Changed to a more reliable query

        fetchNews('world', 9).then(renderHomepage);

    });



    

    // --- 4. INITIALIZATION ---



    function initializePage() {

        renderSidebar();

        

        // **FIXED:** Changed to a more reliable query

        fetchNews('world', 9).then(renderHomepage);

        

        updateSidebarWidgets('home');

    }



    initializePage();

});
