const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SEARCH_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";

let allIssues = [];

// --- Auth Logic ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        fetchIssues();
    } else {
        alert("Invalid credentials");
    }
});

async function fetchIssues(query = '') {
    const container = document.getElementById('issues-container');
    const loader = document.getElementById('loader');
    
    container.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const url = query ? `${SEARCH_URL}${query}` : API_URL;
        const res = await fetch(url);
        const data = await res.json();
        
        allIssues = Array.isArray(data) ? data : (data.data || []); 
        
        renderData(allIssues);
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = `<p class="text-error">Failed to load issues.</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

function renderData(data) {
    const container = document.getElementById('issues-container');
    container.innerHTML = data.map(issue => `
        <div class="card bg-white shadow-sm border-t-4 cursor-pointer hover:shadow-md transition-shadow ${issue.status === 'open' ? 'border-green-500' : 'border-purple-500'}" 
             onclick="showDetails('${issue._id}')">
            <div class="card-body p-5">
                <h2 class="card-title text-md line-clamp-1">${issue.title}</h2>
                <p class="text-sm text-gray-500 line-clamp-2">${issue.description}</p>
                <div class="flex flex-wrap gap-2 mt-2">
                    <span class="badge badge-outline text-xs">${issue.label}</span>
                    <span class="badge badge-ghost text-xs">${issue.priority}</span>
                </div>
                <div class="mt-4 text-xs text-gray-400">
                    By: ${issue.author} • ${new Date(issue.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    `).join('');
}

// --- Filtering & Search ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'border-b-2', 'border-primary', 'font-semibold'));
        e.target.classList.add('active', 'border-b-2', 'border-primary', 'font-semibold');

        const filter = e.target.getAttribute('data-tab');
        if (filter === 'all') {
            renderData(allIssues);
        } else {
            const filtered = allIssues.filter(i => i.status === filter);
            renderData(filtered);
        }
    });
});


document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchIssues(e.target.value);
    }
});

// --- Modal Detail ---
async function showDetails(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const issue = await res.json();
    
    document.getElementById('modal-title').innerText = issue.title;
    document.getElementById('modal-body').innerHTML = `
        <p class="text-gray-700">${issue.description}</p>
        <div class="divider"></div>
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Status:</strong> ${issue.status}</div>
            <div><strong>Priority:</strong> ${issue.priority}</div>
            <div><strong>Author:</strong> ${issue.author}</div>
            <div><strong>Created:</strong> ${new Date(issue.createdAt).toLocaleString()}</div>
        </div>
    `;
    issue_modal.showModal();
}
