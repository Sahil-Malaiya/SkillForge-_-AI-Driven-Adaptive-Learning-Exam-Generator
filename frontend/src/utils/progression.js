import { courseService } from '../services/courseService';
import { subjectService } from '../services/subjectService';
import { topicService } from '../services/topicService';

export const progression = {
    /**
     * Finds the next target (topic, subject, or course) based on the current topic ID.
     */
    findNextTarget: async (currentTopicId) => {
        try {
            // 1. Get current topic and its subject
            const allTopics = await topicService.getAllTopics();
            const currentTopic = allTopics.find(t => t.id === currentTopicId);
            if (!currentTopic) throw new Error('Topic not found');

            const currentSubjectId = currentTopic.subjectId;
            const subjectTopics = await topicService.getTopicsBySubject(currentSubjectId);

            // Sort topics to ensure consistent order (assuming sequential ID or title)
            const sortedTopics = subjectTopics.sort((a, b) => a.id - b.id);
            const currentIndex = sortedTopics.findIndex(t => t.id === currentTopicId);

            // 2. Check for next topic in the same subject
            if (currentIndex !== -1 && currentIndex < sortedTopics.length - 1) {
                const nextTopic = sortedTopics[currentIndex + 1];

                // Need courseId for the new URL structure: /my-courses/:courseId/subjects/:subjectId/topics
                // We have subjectId (currentSubjectId), but need courseId from the subject entity.
                // Optimally we'd have it in the topic or subject already, but let's fetch the subject to be sure.
                const subject = await subjectService.getSubjectById(currentSubjectId);

                return {
                    type: 'TOPIC',
                    id: nextTopic.id,
                    title: nextTopic.title,
                    subjectId: currentSubjectId,
                    courseId: subject.courseId
                };
            }

            // 3. If no next topic, find the next subject in the course
            const allSubjects = await subjectService.getAllSubjects();
            const currentSubject = allSubjects.find(s => s.id === currentSubjectId);
            if (!currentSubject) throw new Error('Subject not found');

            const currentCourseId = currentSubject.courseId;

            // Fetch subjects for this course (need an endpoint or filter)
            // Assuming we have to filter all subjects if no specific endpoint exists,
            // but MyCourses.jsx uses: fetch(`http://localhost:8080/api/subjects/course/${courseId}`)
            const courseSubjectsRes = await fetch(`http://localhost:8080/api/subjects/course/${currentCourseId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const courseSubjects = await courseSubjectsRes.json();
            const sortedSubjects = courseSubjects.sort((a, b) => a.id - b.id);
            const subjectIndex = sortedSubjects.findIndex(s => s.id === currentSubjectId);

            if (subjectIndex !== -1 && subjectIndex < sortedSubjects.length - 1) {
                const nextSubject = sortedSubjects[subjectIndex + 1];
                return {
                    type: 'SUBJECT',
                    id: nextSubject.id,
                    title: nextSubject.name,
                    courseId: currentCourseId
                };
            }

            // 4. If no next subject, find the next course
            const allCourses = await courseService.getAllCourses();
            const sortedCourses = allCourses.sort((a, b) => a.id - b.id);
            const courseIndex = sortedCourses.findIndex(c => c.id === currentCourseId);

            if (courseIndex !== -1 && courseIndex < sortedCourses.length - 1) {
                const nextCourse = sortedCourses[courseIndex + 1];
                return {
                    type: 'COURSE',
                    id: nextCourse.id,
                    title: nextCourse.title
                };
            }

            // 5. Everything completed
            return {
                type: 'COMPLETED',
                message: 'Congratulations! You have completed all courses, subjects, and topics.'
            };
        } catch (error) {
            console.error('Error in progression logic:', error);
            return { type: 'ERROR', message: 'Failed to determine next steps.' };
        }
    },

    /**
     * Gets context (courseId, subjectId) for a specific topic ID.
     */
    getTopicContext: async (topicId) => {
        try {
            const allTopics = await topicService.getAllTopics();
            const topic = allTopics.find(t => t.id === topicId);
            if (!topic) return null;

            const subject = await subjectService.getSubjectById(topic.subjectId);
            return {
                topicId: topic.id,
                subjectId: subject.id,
                courseId: subject.courseId
            };
        } catch (error) {
            console.error('Error getting topic context:', error);
            return null;
        }
    }
};

