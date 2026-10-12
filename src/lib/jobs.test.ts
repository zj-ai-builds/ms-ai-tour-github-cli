import { describe, it, expect } from 'vitest';
import {
    filterJobs,
    filterJobsByDepartment,
    filterJobsByLocation,
    formatPostedDate,
    getUniqueDepartments,
    getUniqueLocations,
    sortByNewest,
} from './jobs';
import type { Job } from '../types/job';

function makeJob(
    slug: string,
    postedDate: string,
    department = 'Technology',
    location = 'Remote',
): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department,
        location,
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('getUniqueDepartments and getUniqueLocations', () => {
    it('returns unique values in sorted order', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Finance', 'Woodinville, WA, USA'),
            makeJob('b', '2027-01-06', 'Technology', 'Remote (US & Canada)'),
            makeJob('c', '2027-01-07', 'Finance', 'Woodinville, WA, USA'),
            makeJob('d', '2027-01-08', 'Marketing', 'Amsterdam, Netherlands'),
        ];

        expect(getUniqueDepartments(jobs)).toEqual(['Finance', 'Marketing', 'Technology']);
        expect(getUniqueLocations(jobs)).toEqual([
            'Amsterdam, Netherlands',
            'Remote (US & Canada)',
            'Woodinville, WA, USA',
        ]);
    });
});

describe('filterJobsByDepartment', () => {
    it('filters to a single department', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Finance'),
            makeJob('b', '2027-01-06', 'Technology'),
            makeJob('c', '2027-01-07', 'Marketing'),
        ];

        expect(filterJobsByDepartment(jobs, 'Technology').map((job) => job.slug)).toEqual(['b']);
        expect(filterJobsByDepartment(jobs, 'all').map((job) => job.slug)).toEqual(['a', 'b', 'c']);
    });
});

describe('filterJobsByLocation', () => {
    it('filters to a single location', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Finance', 'Woodinville, WA, USA'),
            makeJob('b', '2027-01-06', 'Technology', 'Remote (US & Canada)'),
            makeJob('c', '2027-01-07', 'Marketing', 'Amsterdam, Netherlands'),
        ];

        expect(filterJobsByLocation(jobs, 'Remote (US & Canada)').map((job) => job.slug)).toEqual(['b']);
        expect(filterJobsByLocation(jobs, 'all').map((job) => job.slug)).toEqual(['a', 'b', 'c']);
    });
});

describe('filterJobs', () => {
    it('applies department and location together using AND logic', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Technology', 'Remote (US & Canada)'),
            makeJob('b', '2027-01-06', 'Technology', 'Woodinville, WA, USA'),
            makeJob('c', '2027-01-07', 'Finance', 'Remote (US & Canada)'),
        ];

        expect(
            filterJobs(jobs, { department: 'Technology', location: 'Remote (US & Canada)' }).map(
                (job) => job.slug,
            ),
        ).toEqual(['a']);
    });

    it('resets to the full list when both filters are cleared', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Technology', 'Remote (US & Canada)'),
            makeJob('b', '2027-01-06', 'Finance', 'Woodinville, WA, USA'),
        ];

        expect(filterJobs(jobs, { department: 'all', location: 'all' })).toEqual(jobs);
    });

    it('returns an empty array when no jobs match', () => {
        const jobs = [
            makeJob('a', '2027-01-05', 'Technology', 'Remote (US & Canada)'),
            makeJob('b', '2027-01-06', 'Finance', 'Woodinville, WA, USA'),
        ];

        expect(
            filterJobs(jobs, { department: 'Technology', location: 'Woodinville, WA, USA' }),
        ).toEqual([]);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});
