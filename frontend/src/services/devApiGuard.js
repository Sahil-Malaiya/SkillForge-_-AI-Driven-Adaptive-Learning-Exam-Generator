import { authService } from './authService';

const isDev = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
    || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development');

export function warnIfStudentCallingInstructorApi(url) {
    try {
        if (!isDev) return;
        if (!url) return;
        const user = authService.getCurrentUser();
        const role = user?.role || user?.user?.role || user?.userRole;
        if (role === 'STUDENT' && url.includes('/api/instructor/')) {
            // eslint-disable-next-line no-console
            console.warn(`[DEV] Student session attempted call to instructor API: ${url}`);
        }
    } catch (e) {
        // swallow errors in guard
    }
}

export default { warnIfStudentCallingInstructorApi };
