/**
 * RecommendationEngine — AI recommendation logic based on quiz score.
 */
public class RecommendationEngine {

    /**
     * Returns a recommendation message based on the student's score, course, and level.
     * @param course Course identifier
     * @param level  Current level
     * @param score  Student's score (0–100)
     * @return       Recommendation string
     */
    public static String recommend(String course, int level, int score) {
        String topicName = formatTopic(course);

        // Feedback for Spoken English (which relies more on communication rating)
        if ("english".equals(course)) {
            if (score < 50) return "Focus on pronunciation and clarity in " + topicName + ".";
            if (score < 70) return "Good effort! Practice reading aloud more to improve fluency.";
            return "Excellent communication! You're ready for the next level.";
        }

        // Feedback for Java & Python
        if (score < 50) return "Revise Level " + level + " concepts in " + topicName + ".";
        if (score < 70) return "Practice more coding questions on this topic.";
        return "Great job! Move to the next " + topicName + " topic!";
    }

    private static String formatTopic(String course) {
        switch (course) {
            case "english": return "Spoken English";
            case "java":    return "Java Programming";
            case "python":  return "Python Programming";
            default:        return "this subject";
        }
    }
}
