/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/** Return the unique departments currently represented in a list of jobs. */
export function getUniqueDepartments(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.department).filter(Boolean))].sort((a, b) =>
a.localeCompare(b));
}

/** Return the unique locations currently represented in a list of jobs. */
export function getUniqueLocations(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort((a, b) =>
a.localeCompare(b));
}

/** Filter jobs by department when a non-default department is provided. */
export function filterJobsByDepartment(jobs: Job[], department: string | null | undefined): Job[] {
    if (!department || department === 'all') {
        return [...jobs];
    }

    return jobs.filter((job) => job.department === department);
}

/** Filter jobs by location when a non-default location is provided. */
export function filterJobsByLocation(jobs: Job[], location: string | null | undefined): Job[] {
    if (!location || location === 'all') {
        return [...jobs];
    }

    return jobs.filter((job) => job.location === location);
}

/** Apply department and location filters together, using AND logic. */
export function filterJobs(
    jobs: Job[],
    options: { department?: string | null; location?: string | null } = {},
): Job[] {
    const departmentFiltered = filterJobsByDepartment(jobs, options.department);
    return filterJobsByLocation(departmentFiltered, options.location);
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
