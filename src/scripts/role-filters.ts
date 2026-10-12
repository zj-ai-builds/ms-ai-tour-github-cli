import { filterJobs, formatPostedDate } from '../lib/jobs';

const root = document.querySelector('#role-filters');
if (!root) {
    throw new Error('Role filters root not found');
}

const allJobs = JSON.parse(root.dataset.jobs ?? '[]');
const grid = document.querySelector('[data-testid="roles-grid"]') as HTMLDivElement;
const emptyStateWrapper = document.querySelector('[data-testid="empty-state"]').parentElement as HTMLDivElement;
const form = document.querySelector('[data-filter-form]');
const departmentFilter = document.querySelector('[data-testid="department-filter"]') as HTMLSelectElement;
const locationFilter = document.querySelector('[data-testid="location-filter"]') as HTMLSelectElement;
const resetButton = document.querySelector('[data-testid="filter-reset"]') as HTMLAnchorElement;

function renderJobCard(job: {
    slug: string;
    title: string;
    department: string;
    location: string;
    type: string;
    remote: boolean;
    postedDate: string;
    summary: string;
}): string {
    const remoteTag = job.remote
        ? '<span class="inline-flex items-center rounded-full border border-slate-600 bg-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-200">Remote</span>'
        : '';

    return `
        <a
          href="/roles/${job.slug}"
          class="group block bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 hover:translate-y-[-6px]"
          data-testid="role-card"
          data-job-id="${job.slug}"
          data-department="${job.department}"
          data-location="${job.location}"
        >
          <div class="p-6">
            <h3 class="text-xl font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors" data-testid="role-title">
              ${job.title}
            </h3>
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200">${job.department}</span>
              <span class="inline-flex items-center rounded-full border border-slate-600 bg-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-200">${job.type}</span>
              ${remoteTag}
              <span class="inline-flex items-center rounded-full border border-slate-600 bg-slate-700/80 px-2.5 py-1 text-xs font-medium text-slate-200" data-testid="role-location">${job.location}</span>
            </div>
            <p class="text-slate-400 mb-4 text-sm line-clamp-3" data-testid="role-summary">${job.summary}</p>
            <div class="flex items-center justify-end text-sm">
              <span class="text-blue-400 font-medium">View role →</span>
            </div>
            <p class="mt-2 text-xs text-slate-400">Posted ${formatPostedDate(job.postedDate)}</p>
          </div>
        </a>
    `;
}

function applyFilters({ department, location }: { department: string; location: string }): void {
    const filteredJobs = filterJobs(allJobs, { department, location });
    grid.innerHTML = filteredJobs.map(renderJobCard).join('');
    const hasMatches = filteredJobs.length > 0;
    grid.hidden = !hasMatches;
    emptyStateWrapper.hidden = hasMatches;

    const nextParams = new URLSearchParams();
    if (department !== 'all') {
        nextParams.set('department', department);
    }
    if (location !== 'all') {
        nextParams.set('location', location);
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.search = nextParams.toString();
    window.history.replaceState({}, '', nextUrl);
}

function syncFiltersFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    const department = params.get('department') ?? 'all';
    const location = params.get('location') ?? 'all';
    departmentFilter.value = department;
    locationFilter.value = location;
    applyFilters({ department, location });
}

form?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters({
        department: departmentFilter.value || 'all',
        location: locationFilter.value || 'all',
    });
});

resetButton?.addEventListener('click', (event) => {
    event.preventDefault();
    departmentFilter.value = 'all';
    locationFilter.value = 'all';
    applyFilters({ department: 'all', location: 'all' });
    window.location.assign('/');
});

syncFiltersFromUrl();
