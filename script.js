const APIURL = 'https://api.github.com/users/';
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');

// Fetch GitHub user data
async function getUser(username) {
    setLoading(true);
    try {
        const { data } = await axios(APIURL + encodeURIComponent(username.trim()));
        createUserCard(data);
        getRepos(username.trim());
    } catch (err) {
        if (err.response && err.response.status === 404) {
            createErrorCard('No GitHub profile found', 'Check the username and try again.');
        } else if (err.response && err.response.status === 403) {
            createErrorCard('GitHub API limit reached', 'Please wait a little and try again.');
        } else {
            createErrorCard('Unable to load profile', 'Check your internet connection and try again.');
        }
    } finally {
        setLoading(false);
    }
}

// Fetch user repositories
async function getRepos(username) {
    try {
        const { data } = await axios(APIURL + encodeURIComponent(username) + '/repos?sort=created');
        addReposToCard(data);
    } catch (err) {
        const reposEl = document.getElementById('repos');
        if (reposEl) reposEl.innerHTML = '<p class="bio">Repositories could not be loaded.</p>';
    }
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.innerHTML = isLoading ? '<span>Searching...</span><span>···</span>' : '<span>Search</span><span aria-hidden="true">↗</span>';
}

// Create user card
function createUserCard(user) {
    const userID = user.name || user.login;
    const userBio = user.bio ? `<p class="bio">${escapeHTML(user.bio)}</p>` : '';

    const cardHTML = `
    <div class="card">
        <div>
            <img src="${user.avatar_url}" alt="${escapeHTML(user.login)} avatar" class="avatar">
        </div>
        <div class="user-info">
            <div class="profile-heading">
                <div>
                    <h2>${escapeHTML(userID)}</h2>
                    <span class="username">@${escapeHTML(user.login)}</span>
                </div>
                <a class="profile-link" href="${user.html_url}" target="_blank" rel="noopener noreferrer">View GitHub ↗</a>
            </div>
            ${userBio}
            <ul>
                <li>${user.followers}<strong>Followers</strong></li>
                <li>${user.following}<strong>Following</strong></li>
                <li>${user.public_repos}<strong>Public repos</strong></li>
            </ul>
            <h3 class="repos-title">Recent repositories</h3>
            <div id="repos"></div>
        </div>
    </div>`;

    main.innerHTML = cardHTML;
}

// Add repositories to the user card
function addReposToCard(repos) {
    const reposEl = document.getElementById('repos');
    if (!reposEl) return;

    if (!repos.length) {
        reposEl.innerHTML = '<p class="bio">No public repositories found.</p>';
        return;
    }

    repos.slice(0, 5).forEach(repo => {
        const repoEl = document.createElement('a');
        repoEl.classList.add('repo');
        repoEl.href = repo.html_url;
        repoEl.target = '_blank';
        repoEl.rel = 'noopener noreferrer';
        repoEl.innerText = repo.name;
        reposEl.appendChild(repoEl);
    });
}

// Display an error message
function createErrorCard(title, message) {
    main.innerHTML = `
        <div class="message-card">
            <h2>${escapeHTML(title)}</h2>
            <p>${escapeHTML(message)}</p>
        </div>`;
}

// Escape API text before adding it to HTML
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

// Search GitHub profiles only
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = search.value.trim();

    if (username) {
        main.innerHTML = '<div class="message-card"><h2>Searching GitHub...</h2><p>Fetching the public profile.</p></div>';
        getUser(username);
    }
});
